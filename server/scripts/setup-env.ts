import fs from 'fs';
import readline from 'readline';
import path from 'path';

const examplePath = path.join(process.cwd(), '.env.example');
const outPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(examplePath)) {
  console.error('.env.example not found');
  process.exit(1);
}

const example = fs.readFileSync(examplePath, 'utf-8');
const lines = example.split('\n').filter(Boolean);

async function promptForEnv() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const out: string[] = [];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) {
      out.push(line);
      continue;
    }
    const [key, _rest] = line.split('=');
    const defaultValue = line.includes('=') ? line.split('=').slice(1).join('=') : '';
    const answer: string = await new Promise((resolve) => {
      rl.question(`${key} [${defaultValue || 'empty'}]: `, (v) => resolve(v));
    });
    const final = `${key}=${answer || defaultValue}`;
    out.push(final);
  }

  rl.close();
  fs.writeFileSync(outPath, out.join('\n'));
  console.log(`Wrote ${outPath}. Restart server to pick up variables.`);
}

promptForEnv().catch((err) => {
  console.error(err);
  process.exit(1);
});