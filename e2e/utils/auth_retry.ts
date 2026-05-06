export async function loginWithRetry(request: any, email: string, password: string, API_BASE: string, retries: number = 2, delayMs: number = 1000) {
  let res;
  for (let i = 0; i <= retries; i++) {
    res = await request.post(`${API_BASE}/auth/login`, { data: { email, password }, timeout: 5000 });
    if (res && res.ok()) return res;
    if (i < retries) await new Promise(r => setTimeout(r, delayMs));
  }
  return res;
}