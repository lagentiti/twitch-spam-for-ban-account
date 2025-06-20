const { chromium } = require('playwright');

module.exports = async ({ username, password, email, birthDate }) => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Nettoyer les cookies
  await page.context().clearCookies();

  await page.route('**/*', (route, request) => {
    route.continue({
      headers: {
        ...request.headers(),
        'Cache-Control': 'no-store',
      },
    });
  });

  await page.goto('https://www.twitch.tv/signup');
  await page.waitForTimeout(1000);

  await page.fill('input#signup-username', username);
  await page.fill('input#password-input', password);
  await page.click('button[data-a-target="signup-phone-email-toggle"]');
  await page.fill('input#email-input', email);
  await page.locator('select[data-a-target="birthday-date-input"]').selectOption({ label: birthDate.day });
  await page.locator('select[data-a-target="birthday-month-select"]').selectOption({ label: birthDate.month });
  await page.locator('select[aria-label="Select your birthday year"]').selectOption({ label: birthDate.year });
  await page.click('button[data-a-target="passport-signup-button"]');

  // Fermer le navigateur
  // await browser.close();
};