const { chromium } = require('playwright');

module.exports = async ({ username, password, account }) => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.context().clearCookies();
  await page.route('**/*', (route, request) => {
    route.continue({
      headers: {
        ...request.headers(),
        'Cache-Control': 'no-store',
      },
    });
  });

  await page.goto('https://twitch.tv/'+username);
  await page.waitForTimeout(2000);

  // Fermer le navigateur
  // await browser.close();
};