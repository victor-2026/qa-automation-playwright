import { chromium } from 'playwright';

const htmlPath = '/Users/victor/Projects/qa-automation-sandbox/phase2-carousel.html';
const pdfPath = '/Users/victor/Projects/qa-automation-sandbox/phase2-carousel.pdf';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.pdf({
  path: pdfPath,
  width: '1920px',
  height: '1080px',
  printBackground: true,
  margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
});
await browser.close();
console.log('✅ PDF saved:', pdfPath);
