const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--enable-javascript', '--disable-web-security']
  });
  const context = await browser.newContext({
    javaScriptEnabled: true
  });
  const page = await context.newPage();
  
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' });
  
  console.log('Waiting for React to render...');
  await page.waitForTimeout(5000);
  
  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('Contains input:', html.includes('input'));
  console.log('Contains email:', html.includes('email'));
  
  const inputs = await page.locator('input').count();
  console.log(`Found ${inputs} inputs`);
  
  const buttons = await page.locator('button').count();
  console.log(`Found ${buttons} buttons`);
  
  await browser.close();
  console.log('Done');
}

runTests().catch(console.error);
