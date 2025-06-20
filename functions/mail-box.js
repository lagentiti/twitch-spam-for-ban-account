const { chromium } = require('playwright');

module.exports = async ({ email, password }) => {
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

  await page.goto('https://account.proton.me/mail');
  await page.waitForTimeout(2000);
  await page.fill('input#username', email);
  await page.fill('input#password', password);
  await page.click('button[class="button w-full button-large button-solid-norm mt-6"]');
  await page.waitForTimeout(10000);

  const maDiv = await page.locator('div[data-shortcut-target="item-container-wrapper"] > div[class="item-column flex-1 flex flex-nowrap flex-column justify-center item-titlesender"] > div[class="flex items-center flex-nowrap"] > div[class="flex-1"] > div[class="flex items-center item-firstline"] > div[class="item-senders flex-1 flex items-center flex-nowrap pr-4 text-semibold"] > span[class="inline-flex max-w-full text-ellipsis"] > span[class="inline-block max-w-full text-ellipsis"] > span');

  // Récupérer le texte de cette div
  const texte = await maDiv.innerText();
  console.log("a+ " + texte);

  const code = 1;
  return code;
};