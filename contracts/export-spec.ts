/**
 * Export OpenAPI spec from running FastAPI backend.
 * Usage: npx tsx contracts/export-spec.ts [backend_url]
 * Output: contracts/openapi.json
 */

import * as fs from 'fs';
import * as path from 'path';

const BACKEND_URL = process.argv[2] || process.env.API_BASE_URL || 'http://localhost:8000';

if (!BACKEND_URL.startsWith('http')) {
  console.error(`Invalid BACKEND_URL: "${BACKEND_URL}" — must start with http:// or https://`);
  console.error('Usage: npx tsx contracts/export-spec.ts [backend_url]');
  process.exit(1);
}
const OUTPUT_PATH = path.join(__dirname, 'openapi.json');

async function exportSpec() {
  console.log(`Fetching OpenAPI spec from ${BACKEND_URL}/openapi.json ...`);

  try {
    const res = await fetch(`${BACKEND_URL}/openapi.json`);
    if (!res.ok) {
      console.error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
      process.exit(1);
    }

    const spec = await res.json();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2));

    const endpoints = Object.keys(spec.paths || {}).length;
    const schemas = Object.keys(spec.components?.schemas || {}).length;
    console.log(`✅ Exported to ${OUTPUT_PATH}`);
    console.log(`   ${endpoints} endpoints, ${schemas} schemas`);
  } catch (err) {
    console.error(`Error: ${err}`);
    console.error('Make sure the backend is running (docker-compose up or npm run dev)');
    process.exit(1);
  }
}

exportSpec();
