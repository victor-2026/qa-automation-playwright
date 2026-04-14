const { chromium, devices } = require('playwright');
const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60000);

let browser;
let page;

Given('I am on the login page', async function() {
  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('[data-testid="auth-email-input"]', { timeout: 30000 });
});

Given('I am logged in', async function() {
  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('[data-testid="auth-email-input"]', { timeout: 30000 });
  await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
  await page.fill('[data-testid="auth-password-input"]', 'alice123');
  await page.click('[data-testid="auth-login-btn"]');
  await page.waitForTimeout(3000);
});

When('I enter {string} as email', async function(email) {
  await page.fill('[data-testid="auth-email-input"]', email);
});

When('I enter {string} as password', async function(password) {
  await page.fill('[data-testid="auth-password-input"]', password);
});

When('I click the login button', async function() {
  await page.click('[data-testid="auth-login-btn"]');
});

Then('I should be logged in', async function() {
  await page.waitForTimeout(2000);
  const url = page.url();
  const isAuthenticated = await page.locator('[data-testid="nav-feed"]').isVisible().catch(() => false);
  if (!url.includes('feed') && !isAuthenticated) {
    console.log(`Current URL: ${url}`);
    throw new Error(`Expected to be logged in, but URL is ${url}`);
  }
});

Then('I should see an error message', async function() {
  await page.waitForSelector('[data-testid="auth-error-message"]', { timeout: 5000 });
});

After(async function() {
  if (browser) {
    await browser.close();
  }
});
