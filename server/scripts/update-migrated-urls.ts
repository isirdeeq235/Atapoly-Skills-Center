import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import prisma from "../src/lib/prisma";

const MIGRATION_FILE = path.join(process.cwd(), "tmp_migration", "migration_results.json");

function isSafeIdentifier(name: string) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

async function main() {
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error("Migration results file not found. Run migrate:supabase-to-s3 first. Expected:", MIGRATION_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(MIGRATION_FILE, "utf-8");
  const mappings = JSON.parse(raw) as Array<{ name: string; success: boolean; s3Url?: string }>;
  if (!mappings.length) {
    console.error("No migrated objects found in migration_results.json");
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "";
  const confirm = process.env.MIGRATION_CONFIRM === "true";

  console.log(`Loaded ${mappings.length} migrated mappings. DRY-RUN mode = ${!confirm}`);

  // Build search fragments (name and likely public URL)
  const mappingEntries = mappings
    .filter((m) => m.success && m.s3Url)
    .map((m) => {
      const name = m.name;
      const s3Url = m.s3Url!;
      const supabasePublicUrl = SUPABASE_URL && SUPABASE_BUCKET ? `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${SUPABASE_BUCKET}/${name}` : null;
      const fragments = [name];
      if (supabasePublicUrl) fragments.push(supabasePublicUrl);
      // also include encoded variant
      fragments.push(encodeURIComponent(name));
      return { name, s3Url, fragments: Array.from(new Set(fragments)) };
    });

  // Get candidate columns (text, varchar, json, jsonb)
  const cols: Array<{ table: string; column: string; data_type: string }> = await prisma.$queryRawUnsafe(
    `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND data_type IN ('text','character varying','json','jsonb') ORDER BY table_name`,
  );

  const results: Array<any> = [];

  for (const col of cols) {
    if (!isSafeIdentifier(col.table) || !isSafeIdentifier(col.column)) continue;
    for (const m of mappingEntries) {
      for (const frag of m.fragments) {
        try {
          const likePattern = `%${frag}%`;
          let countRes: any;
          if (col.data_type === "json" || col.data_type === "jsonb") {
            countRes = await prisma.$queryRawUnsafe(`SELECT count(*)::int FROM "${col.table}" WHERE "${col.column}"::text LIKE $1`, likePattern);
          } else {
            countRes = await prisma.$queryRawUnsafe(`SELECT count(*)::int FROM "${col.table}" WHERE "${col.column}" LIKE $1`, likePattern);
          }

          const count = countRes && countRes[0] ? (countRes[0].count || Object.values(countRes[0])[0]) : 0;

          if (Number(count) > 0) {
            console.log(`Found ${count} rows in ${col.table}.${col.column} containing '${frag}' -> will replace with ${m.s3Url}`);
            results.push({ table: col.table, column: col.column, fragment: frag, count: Number(count), s3Url: m.s3Url });
            if (confirm) {
              if (col.data_type === "json" || col.data_type === "jsonb") {
                const q = `UPDATE "${col.table}" SET "${col.column}" = replace("${col.column}"::text, $1, $2)::jsonb WHERE "${col.column}"::text LIKE $3`;
                await prisma.$executeRawUnsafe(q, frag, m.s3Url, likePattern);
              } else {
                const q = `UPDATE "${col.table}" SET "${col.column}" = replace("${col.column}", $1, $2) WHERE "${col.column}" LIKE $3`;
                await prisma.$executeRawUnsafe(q, frag, m.s3Url, likePattern);
              }
              console.log(`Updated ${col.table}.${col.column} for fragment '${frag}'`);
            }
          }
        } catch (err: any) {
          console.error(`Error checking ${col.table}.${col.column} for fragment '${frag}':`, err?.message || err);
        }
      }
    }
  }

  const outFile = path.join(process.cwd(), "tmp_migration", `update_results-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ confirm, results }, null, 2));
  console.log(`Done. Results saved to ${outFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
