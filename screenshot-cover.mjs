import { chromium } from 'playwright';
import path from 'path';

const [url, output] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 644 } });
await page.goto('file://' + path.resolve(url), { waitUntil: 'networkidle' });
await page.screenshot({ path: output, fullPage: false });
await browser.close();
