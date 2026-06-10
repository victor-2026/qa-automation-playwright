/**
 * Pact Consumer Test Runner: Auth API
 *
 * Matches ACTUAL backend behavior. Uses real tokens and UUID IDs.
 *
 * Run: npx tsx contracts/consumers/auth.pact.spec.ts
 */

import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import * as path from 'path';
import * as fs from 'fs';

const API_BASE = process.env.API_BASE_URL || 'https://buzzhive-test.onrender.com';
const PACT_DIR = path.resolve(__dirname, '../pacts');
if (!fs.existsSync(PACT_DIR)) fs.mkdirSync(PACT_DIR, { recursive: true });

const provider = new PactV4({
  consumer: 'qa-sandbox-frontend',
  provider: 'qa-sandbox-api',
  dir: PACT_DIR,
  logLevel: 'warn',
  requestFilter: (req: any, _res: any, next: any) => {
    if (req.headers?.authorization && !req.headers?.Authorization) {
      req.headers.Authorization = req.headers.authorization;
    }
    next();
  },
});

let passed = 0;
let failed = 0;

async function run(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message?.split('\n')[0] || err}`);
    failed++;
  }
}

async function getRealToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@buzzhive.com', password: 'alice123' }),
  });
  const body = await res.json() as Record<string, string>;
  return body.access_token;
}

async function main() {
  console.log('\n🔐 Auth API — Consumer Contract Tests\n');

  let realToken = '';
  try {
    realToken = await getRealToken();
    console.log(`  🔑 Got real token (${realToken.substring(0, 20)}...)\n`);
  } catch {
    console.log('  ⚠️  Backend not running — using placeholder token\n');
    realToken = 'placeholder-token';
  }

  await run('POST /api/auth/login → 200 (valid credentials)', async () => {
    await provider
      .addInteraction()
      .given('a user exists with email alice@buzzhive.com')
      .uponReceiving('a login request with valid credentials')
      .withRequest('POST', '/api/auth/login', (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ email: 'alice@buzzhive.com', password: 'alice123' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({
          access_token: MatchersV3.string(realToken),
          refresh_token: MatchersV3.string('real-refresh-token'),
          token_type: 'bearer',
        });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'alice@buzzhive.com', password: 'alice123' }),
        });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const body = await res.json() as Record<string, unknown>;
        if (!body.access_token) throw new Error('Missing access_token');
        if (!body.refresh_token) throw new Error('Missing refresh_token');
        if (body.token_type !== 'bearer') throw new Error(`Expected token_type=bearer`);
      });
  });

  await run('POST /api/auth/login → 401 (invalid credentials)', async () => {
    await provider
      .addInteraction()
      .given('a user exists with email alice@buzzhive.com')
      .uponReceiving('a login request with invalid password')
      .withRequest('POST', '/api/auth/login', (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ email: 'alice@buzzhive.com', password: 'wrongpassword' });
      })
      .willRespondWith(401, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ detail: 'Invalid email or password', status_code: 401 });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'alice@buzzhive.com', password: 'wrongpassword' }),
        });
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
        const body = await res.json() as Record<string, unknown>;
        if (!body.detail) throw new Error('Missing detail field');
      });
  });

  await run('GET /api/auth/me → 200 (authenticated)', async () => {
    await provider
      .addInteraction()
      .given('a user is authenticated')
      .uponReceiving('a request for the current user profile with valid token')
      .withRequest('GET', '/api/auth/me', (builder) => {
        builder.headers({ Authorization: `Bearer ${realToken}` });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({
          id: MatchersV3.string('00000000-0000-0000-0000-000000000003'),
          email: 'alice@buzzhive.com',
          username: 'alice_dev',
          display_name: 'Alice Developer',
          role: 'user',
          is_active: true,
          is_verified: true,
          is_private: false,
          created_at: MatchersV3.string('2026-03-14T18:23:31.259089Z'),
          updated_at: MatchersV3.string('2026-06-02T00:00:00.000Z'),
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          is_following: false,
          is_followed_by: false,
        });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/auth/me`, {
          headers: { Authorization: `Bearer ${realToken}` },
        });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const body = await res.json() as Record<string, unknown>;
        if (!body.id || !body.email || !body.username) throw new Error('Missing required fields');
      });
  });

  await run('GET /api/auth/me → 401 (invalid token)', async () => {
    await provider
      .addInteraction()
      .given('no user is authenticated')
      .uponReceiving('a request with an invalid token')
      .withRequest('GET', '/api/auth/me', (builder) => {
        builder.headers({ Authorization: 'Bearer invalid-token' });
      })
      .willRespondWith(401, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ detail: 'Invalid or expired token', error_code: 'UNAUTHORIZED', status_code: 401 });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/auth/me`, {
          headers: { Authorization: 'Bearer invalid-token' },
        });
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      });
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
