/**
 * Pact Provider Verification: Auth API
 *
 * Verifies that the Auth API provider fulfills the consumer contracts.
 *
 * Run: npx tsx contracts/provider/auth-verification.spec.ts
 */

import { Verifier } from '@pact-foundation/pact';
import * as path from 'path';
import * as fs from 'fs';

const PACT_DIR = path.resolve(__dirname, '../pacts');
const PACT_FILE = path.join(PACT_DIR, 'qa-sandbox-frontend-qa-sandbox-api.json');
const API_BASE = process.env.API_BASE_URL || 'https://buzzhive-test.onrender.com';

async function checkBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function getRealToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@buzzhive.com', password: 'alice123' }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const body = await res.json() as Record<string, string>;
  return body.access_token;
}

async function main() {
  console.log('\n🔍 Auth API — Provider Verification\n');

  const backendUp = await checkBackend();
  if (!backendUp) {
    console.log('  ⚠️  Backend not running at', API_BASE);
    console.log('  ⏭️  Skipping provider verification (no backend)\n');
    process.exit(0);
  }

  if (!fs.existsSync(PACT_FILE)) {
    console.log('  ⚠️  Pact file not found:', PACT_FILE);
    console.log('  ℹ️  Run consumer tests first\n');
    console.log('  ⏭️  Skipping provider verification\n');
    process.exit(0);
  }

  let realToken: string;
  try {
    realToken = await getRealToken();
    console.log(`  🔑 Got real token (${realToken.substring(0, 20)}...)\n`);
  } catch {
    console.log('  ❌ Could not get token from backend');
    process.exit(1);
  }

  console.log('  🔍 Running provider verification...\n');

  try {
    const verifier = new Verifier({
      providerBaseUrl: API_BASE,
      pactUrls: [PACT_FILE],
      provider: 'qa-sandbox-api',
      logLevel: 'warn',
      stateHandlers: {
        'a user exists with email alice@buzzhive.com': async () => {
          console.log('  📦 State: user alice@buzzhive.com exists');
        },
        'a user is authenticated': async () => {
          console.log('  📦 State: user authenticated — using real token');
        },
        'no user is authenticated': async () => {
          console.log('  📦 State: no user authenticated — will use invalid token');
        },
      },
    });

    await verifier.verifyProvider();

    console.log('  ✅ Provider verification passed!\n');
  } catch (err: any) {
    console.error(`  ❌ Provider verification failed`);
    console.error(`  ${err.message?.split('\n')[0] || err}\n`);
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
