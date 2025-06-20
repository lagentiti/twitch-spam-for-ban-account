const { chromium } = require('playwright');
const random = require('./random.js');
const { generateTempEmail, getEmails } = require('./temp-mail.js')
const delay = require('./delay.js');

module.exports = async () => {
  const name = random(16);
  const password = random(32);

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

  await page.goto('https://account.proton.me/fr/mail/signup');
  await page.waitForTimeout(2000);
  await page.click('div[class="p-3 md:px-6 md:pb-6 md:pt-4 w-full"]');

  const iframeElement = await page.waitForSelector('iframe[src="https://account-api.proton.me/challenge/v4/html?Type=0&Name=email"]');
  const iframe = await iframeElement.contentFrame();

  await iframe.waitForSelector('input#username', { state: 'visible' });
  await iframe.fill('input#username', name);

  await page.waitForSelector('input#password', { state: 'visible' });
  await page.fill('input#password', password);
  await page.waitForSelector('input#password-confirm', { state: 'visible' });
  await page.fill('input#password-confirm', password);
  await page.click('button[class="button button-pill button-large button-solid-norm block mx-auto"]');
  await page.waitForTimeout(2000);
  await page.click('button[class="button w-full button-large button-ghost-norm"]');

  // faut mettre l'email temporaire 
  await page.click('button[data-testid="tab-header-e-mail-button"]');
  const email = await generateTempEmail();
  await page.fill('input#email', email);
  await page.click('button[class="button w-full button-large button-solid-norm mt-6"]');

  await delay(5000);
  function checkEmail() {
    return getEmails(email).then(emails => {
      if (emails.length > 0) {
        return emails[0].subject.includes('Proton Mail');
      }
      return false;
    });
  };
  console.log(await checkEmail());

  // await page.waitForTimeout(20000);
  // await page.click('button[class="button w-full button-large button-solid-norm mt-6"]');
  // await page.click('button[class="button w-full button-large button-ghost-norm mt-2"]');
  // await page.click('button[class="button w-full button-medium button-solid-norm"]');
  // await page.waitForTimeout(1000);
  // await page.click('button[class="button w-full button-large button-solid-norm"]');
  // await page.click('button[class="button w-full button-large button-outline-weak"]');
  // await page.click('button[class="button w-full button-large button-solid-norm"]');
  // await page.click('button[class="button w-full button-large button-solid-norm"]');
  // await browser.close();
  
  return {
    email: name + '@proton.me',
    password: password
  };
};