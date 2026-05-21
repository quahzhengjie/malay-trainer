// One-off helper: report every CSV field-count error across all bank files.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Papa from 'papaparse';

const dir = join(import.meta.dirname, '..', 'content', 'bank');
for (const f of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
  const r = Papa.parse(readFileSync(join(dir, `${f}.csv`), 'utf8'), {
    header: true,
    skipEmptyLines: true,
  });
  if (r.errors.length) {
    console.log(`${f}.csv: ${r.errors.length} error(s)`);
    for (const e of r.errors) console.log(`  file line ${e.row + 2}: ${e.message}`);
  } else {
    console.log(`${f}.csv: OK (${r.data.length} rows)`);
  }
}
