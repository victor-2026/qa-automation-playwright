// e2e/setup/auth_helpers.ts
export async function ensureLogin(request, email, password, apiBase) {
  let res = await request.post(`${apiBase}/auth/login`, {
    data: { email, password },
    timeout: 5000
  });
  if (res.status() !== 200) {
    await new Promise(r => setTimeout(r, 1000));
    res = await request.post(`${apiBase}/auth/login`, {
      data: { email, password },
      timeout: 5000
    });
  }
  if (res.status() !== 200) throw new Error(`Login failed: ${res.status()}`);
  const body = await res.json().catch(() => null);
  if (!body?.access_token) throw new Error('Missing access_token');
  return body;
}