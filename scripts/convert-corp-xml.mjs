import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidates = [
  resolve(__dirname, '../../corp.xml'),
  resolve(__dirname, '../corp.xml'),
  resolve(__dirname, '../public/corp.xml'),
];

let xmlPath = null;
for (const p of candidates) {
  if (existsSync(p)) {
    xmlPath = p;
    break;
  }
}

if (!xmlPath) {
  console.error('corp.xml not found. Searched:', candidates);
  process.exit(1);
}

console.log(`Reading corp.xml from: ${xmlPath}`);
const xml = readFileSync(xmlPath, 'utf-8');

const parser = new XMLParser({ ignoreAttributes: false, isArray: () => false });
const parsed = parser.parse(xml);

const rawList = parsed?.result?.list ?? [];
const list = Array.isArray(rawList) ? rawList : [rawList];

const corps = list.map((item) => ({
  corp_code: String(item.corp_code ?? '').padStart(8, '0'),
  corp_name: String(item.corp_name ?? ''),
  corp_eng_name: String(item.corp_eng_name ?? ''),
  stock_code: String(item.stock_code ?? ''),
}));

const outputPath = resolve(__dirname, '../public/corps.json');
writeFileSync(outputPath, JSON.stringify(corps), 'utf-8');
console.log(`Done. Wrote ${corps.length} companies to public/corps.json`);
