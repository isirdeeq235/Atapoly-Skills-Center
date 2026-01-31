import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import { uploadBuffer } from "../src/lib/s3";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_BUCKET) {
  console.error("Please set SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_BUCKET in your .env");
  process.exit(1);
}

async function listObjects(prefix = "") {
  const url = `${SUPABASE_URL!.replace(/\/$/, "")}/storage/v1/object/list/${SUPABASE_BUCKET}?prefix=${encodeURIComponent(prefix)}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
    } as HeadersInit,
  });
  if (!res.ok) throw new Error(`Failed to list objects: ${res.status} ${await res.text()}`);
  return (await res.json()) as Array<{ name: string; id?: string; updated_at?: string }>;
}

async function downloadObject(name: string) {
  const url = `${SUPABASE_URL!.replace(/\/$/, "")}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
    } as HeadersInit,
  });
  if (!res.ok) throw new Error(`Failed to download ${name}: ${res.status} ${await res.text()}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer;
}

async function main() {
  console.log("Listing objects in Supabase bucket:", SUPABASE_BUCKET);
  const objects = await listObjects();
  console.log(`Found ${objects.length} objects`);

  const outDir = path.join(process.cwd(), "tmp_migration");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const results: Array<{ name: string; success: boolean; error?: string; s3Url?: string }> = [];

  for (const obj of objects) {
    try {
      console.log("Downloading", obj.name);
      const buf = await downloadObject(obj.name);
      // Optionally write to temp dir
      const tmpPath = path.join(outDir, obj.name.replace(/\//g, "_"));
      fs.writeFileSync(tmpPath, buf);

      console.log("Uploading to S3 as", obj.name);
      const s3Url = await uploadBuffer(obj.name, buf);
      results.push({ name: obj.name, success: true, s3Url });
      console.log("Uploaded ->", s3Url);
    } catch (err: any) {
      console.error("Failed for", obj.name, err?.message || err);
      results.push({ name: obj.name, success: false, error: err?.message || String(err) });
    }
  }

  const outFile = path.join(process.cwd(), "tmp_migration", "migration_results.json");
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log("Migration completed. Results saved to", outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});