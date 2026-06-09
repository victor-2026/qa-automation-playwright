const MAX_RETRIES = 3
const RETRY_DELAY = 30000

export async function wakeBackend(): Promise<boolean> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await fetch('/api/health')
      if (res.ok) return true
    } catch {}
    if (i < MAX_RETRIES - 1) {
      await new Promise(r => setTimeout(r, RETRY_DELAY))
    }
  }
  return false
}
