import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('http://localhost:3003/d/dora-core/dora-core-e28094-qa-metrics?orgId=1&from=2026-05-14&to=now&timezone=browser', {
  waitUntil: 'networkidle'
});

// Wait for panels to render
await page.waitForTimeout(3000);

await page.screenshot({ path: '/tmp/grafana-dora.png', fullPage: true });
console.log('Screenshot saved to /tmp/grafana-dora.png');
await browser.close();
