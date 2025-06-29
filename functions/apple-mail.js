const { chromium } = require('playwright');
const colors = require('colors');
const fs = require('fs');
const random = require('../functions/random.js');
const Imap = require('imap');
const cheerio = require('cheerio');
const { simpleParser } = require('mailparser');

module.exports.getData = async (lang1) => {
  let lang = lang1
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.context().clearCookies();

  await page.route('**/*', (route, request) => {
    route.continue({
      headers: {
        ...request.headers(),
        'Cache-Control': 'no-store',
      },
    });
  });

  await page.goto('https://www.icloud.com/mail');

  console.log(lang.applemail.c1.yellow);

  console.log(lang.applemail.c2.yellow);
  await page.waitForTimeout(60000);

  console.log(lang.applemail.c3.green);

  const cookies = await context.cookies();

  fs.writeFileSync('./data/icloud-cookie.json', JSON.stringify(cookies, null, 2));
  console.log(lang.applemail.c4.green);

  return await browser.close();
};

module.exports.createEmail = async () => {
  console.log('Démarrage de createEmail...');

  const jsondata = require('../data/icloud-cookie.json');

  try {
    const browser = await chromium.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.icloud.com/');
    await context.clearCookies();
    await context.addCookies(jsondata);

    await page.goto('https://www.icloud.com/icloudplus');
    await page.waitForTimeout(1000);

    await page.click('button[aria-label="Show more options for Masquer mon adresse e‑mail"]');
    await page.waitForTimeout(3000);

    const iframeElement = await page.waitForSelector('iframe[data-name="hidemyemail"]');
    const iframe = await iframeElement.contentFrame();

    await iframe.waitForSelector('button[title="Ajouter"]', { state: 'visible' });
    await iframe.click('button[title="Ajouter"]');

    await page.waitForTimeout(3000);

    await iframe.waitForSelector('div[class="GeneratedEmail-text"] > div[class="Typography GeneratedEmail-hme Typography-semibold"]', { state: 'visible' });
    const emailAdresse = await iframe.locator('div[class="GeneratedEmail-text"] > div[class="Typography GeneratedEmail-hme Typography-semibold"]').allTextContents();
    const tag = random(32);

    await iframe.waitForSelector('input[name="hme-label"]', { state: 'visible' });
    await iframe.fill('input[name="hme-label"]', tag);
    await page.waitForTimeout(2000);

    await iframe.waitForSelector('button[class="button button-rounded-rectangle"]', { state: 'visible' });
    await iframe.click('button[class="button button-rounded-rectangle"]');

    console.log('Email généré:', emailAdresse[0], 'Tag:', tag);

    await page.waitForTimeout(3000)

    await browser.close();

    return {
      email: emailAdresse[0],
      tag: tag,
    };
  } catch (error) {
    console.error('Erreur dans createEmail:', error);
  }
};

module.exports.mailbox = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    const imapConfig = {
      user: email,
      password: password,
      host: 'imap.mail.me.com',
      port: 993,
      tls: true,
    };

    const imap = new Imap(imapConfig);

    imap.once('ready', function () {
      imap.openBox('INBOX', true, function (err, box) {
        if (err) {
          reject(err);
          return;
        }

        const searchCriteria = ['ALL'];

        imap.search(searchCriteria, function (err, results) {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            resolve("Aucun message trouvé.");
            return;
          }

          const mostRecentMsgSeq = results[results.length - 1];

          const fetch = imap.fetch(mostRecentMsgSeq, { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'] });

          fetch.on('message', function (msg, seqno) {
            let message = '';
            msg.on('body', function (stream) {
              stream.on('data', function (chunk) {
                message += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              const headers = Imap.parseHeader(message);
              const subject = headers.subject[0];

              const code = extractVerificationCode(subject);

              resolve(code);
            });
          });

          fetch.once('end', function () {
            imap.end();
          });
        });
      });
    });

    imap.once('error', function (err) {
      reject(err);
    });

    imap.once('end', function () {

    });

    imap.connect();
  });
};

module.exports.mailboxLogin = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    const imapConfig = {
      user: email,
      password: password,
      host: 'imap.mail.me.com',
      port: 993,
      tls: true,
    };

    const imap = new Imap(imapConfig);

    imap.once('ready', function () {
      imap.openBox('INBOX', true, function (err, box) {
        if (err) {
          reject(err);
          return;
        }

        const searchCriteria = ['ALL'];

        imap.search(searchCriteria, function (err, results) {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            resolve(0);
            return;
          }

          const mostRecentMsgSeq = results[results.length - 1];

          const fetch = imap.fetch(mostRecentMsgSeq, { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'] });

          fetch.on('message', function (msg, seqno) {
            let message = '';
            msg.on('body', function (stream) {
              stream.on('data', function (chunk) {
                message += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              const $ = cheerio.load((await simpleParser(message)).text);

              return resolve($('div[class="3Dheader-message-code"]').text());
            });
          });

          fetch.once('end', function () {
            imap.end();
          });
        });
      });
    });

    imap.once('error', function (err) {
      reject(err);
    });

    imap.once('end', function () {

    });

    imap.connect();
  });
};

function extractVerificationCode(subject) {
  const regex = /\b\d{6}\b/;
  const match = subject.match(regex);
  return match ? match[0] : null;
};


module.exports.deleteEmail = async (tag) => {
  const jsondata = require('./data/icloud-cookie.json');

  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.icloud.com/');
  await context.clearCookies();
  await context.addCookies(jsondata);

  await page.goto('https://www.icloud.com/icloudplus');

  await page.route('**/*', (route, request) => {
    route.continue({
      headers: {
        ...request.headers(),
        'Cache-Control': 'no-store',
      },
    });
  });

  await page.waitForTimeout(1000);
  await page.click('button[aria-label="Show more options for Masquer mon adresse e‑mail"]');
  await page.waitForTimeout(3000);

  const iframeElement = await page.waitForSelector('iframe[data-name="hidemyemail"]');
  const iframe = await iframeElement.contentFrame();

  await iframe.waitForTimeout(1000);

  const h2s = await iframe.$$eval('h2.Typography.Typography-h2', (elements) =>
    elements.map(el => el.innerText)
  );


  const targetIndex = h2s.indexOf('7t1lHGd5BDlLcZPbi1axMqI9znwo05zW');
  
  await iframe.click(`button[class=\"button button-bare button-expand button-rounded-rectangle\"]:nth-child(${targetIndex})`);
  await iframe.waitForTimeout(1000);
  await iframe.click(`button[class="button button-secondary button-rounded-rectangle"]:nth-child(1)`)
  await iframe.waitForTimeout(1000);
  await iframe.click(`button[class="button button-secondary button-rounded-rectangle"] > span[class="isDestructive"]`)

  return await browser.close();
};



module.exports.deleteMsg = async ({ email, password }) => {
    return new Promise((resolve, reject) => {
    const imapConfig = {
      user: email,
      password: password,
      host: 'imap.mail.me.com',
      port: 993,
      tls: true,
    };

    const imap = new Imap(imapConfig);

    imap.once('ready', function () {
      imap.openBox('INBOX', false, function (err, box) {
        if (err) {
          reject(err);
          return;
        }

        const searchCriteria = ['ALL'];

        imap.search(searchCriteria, function (err, results) {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            resolve(lang.applemail.nomsg);
            return;
          }

          const mostRecentMsgSeq = results[results.length - 1];

          const fetch = imap.fetch(mostRecentMsgSeq, { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'] });

          fetch.on('message', function (msg, seqno) {
            let message = '';
            msg.on('body', function (stream) {
              stream.on('data', function (chunk) {
                message += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              const headers = Imap.parseHeader(message);
              const subject = headers.subject[0];

              const code = extractVerificationCode(subject);

              imap.addFlags(seqno, '\\Deleted', function (err) {
                if (err) {
                  console.log(lang.applemail.error1, err);
                  return;
                }

                
                imap.expunge(function (err) {
                  if (err) {
                    return;
                  }
                  resolve(code); 
                });
              });
            });
          });

          fetch.once('end', function () {
            imap.end();
          });
        });
      });
    });

    imap.once('error', function (err) {
      reject(err);
    });

    imap.once('end', function () {
    });

    imap.connect();
  });
};