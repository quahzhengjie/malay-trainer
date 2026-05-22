// One-off helper: report every CSV field-count error across all bank files.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Papa from 'papaparse';

const dir = join(import.meta.dirname, '..', 'content', 'bank');
for (const file of readdirSync(dir).filter((f) => f.endsWith('.csv')).sort()) {
  const r = Papa.parse(readFileSync(join(dir, file), 'utf8'), {
    header: true,
    skipEmptyLines: true,
  });
  if (r.errors.length) {
    console.log(`${file}: ${r.errors.length} error(s)`);
    for (const e of r.errors) console.log(`  file line ${e.row + 2}: ${e.message}`);
  } else {
    console.log(`${file}: OK (${r.data.length} rows)`);
  }
}
