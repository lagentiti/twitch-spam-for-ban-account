const { createEmail, deleteEmail, deleteMsg, getData, mailbox } = require('./functions/apple-mail.js');
const createtwitch = require('./functions/createtwitch.js');
const report = require('./functions/report.js');
const figlet = require('figlet');
const colors = require('colors');
const readline = require('readline');
const random = require('./functions/random.js');
const aniv = require('./functions/anniversary.js');
const agent = require('./functions/user-agent.js');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let lang;

(async () => {
  await figlet('lagent_titi', function (err, data) {
    if (err) {
      console.log('Une erreur est survenue.');
      console.log(err);
      return;
    }
    console.log(data.blue);
  });

  await console.log("Choose a language, for example fr (for French)".bgBlue);

  const askLanguage = () => {
    rl.question('Language ?: '.yellow, (answer) => {
      try {
        lang = require('./langs/' + answer.toString() + '.js');
        if (!lang) {
          console.log("❌ The language does not exist.".red);
          askLanguage();
        } else {
          console.log(lang.index.lang.green);
          const askEmail = () => {
            rl.question(lang.index.c1.yellow, (answer) => {
              if (answer && answer.trim()) {
                const emailIcloud = answer;
                const askPassword = () => {
                  console.log("TUTO: https://support.apple.com/en-us/102654".bgYellow);
                  rl.question(lang.index.c2.yellow, async (answer) => {
                    if (answer && answer.trim()) {
                      const passwordIcloud = answer;
                      const askUserReport = () => {
                        rl.question(lang.index.c4.yellow, async (answer) => {
                          if (answer && answer.trim()) {
                            const UserReport = answer;
                            const asknumberofReport = () => {
                              rl.question(lang.index.c5.yellow, async (answer) => {
                                if (answer && answer.trim()) {
                                  const numberOfReport = answer;
                                  await getData(lang);
                                  await fs.writeFileSync('./data/tmp-data.json', JSON.stringify({
                                    "emailIcloud": emailIcloud,
                                    "passwordIcloud": passwordIcloud,
                                  }, null, 2));
                                  async function newAccAndTwitchRep() {
                                    const resp = await createEmail();
                                    const { email, tag } = resp;
                                    const dataTwitch = {
                                      username: random(16),
                                      password: random(32),
                                      email: email,
                                      birthDate: aniv(),
                                      useragent: agent(),
                                    };

                                    await createtwitch(dataTwitch);

                                    await report({
                                      username: dataTwitch.username,
                                      password: dataTwitch.password,
                                      usernameReport: UserReport,
                                      userAgent: dataTwitch.useragent,
                                    });
                                  };
                                  for (let i = 0; i < numberOfReport; i++) {
                                    await newAccAndTwitchRep();
                                  };
                                };
                              });
                            };
                            asknumberofReport();
                          };
                        });
                      };
                      askUserReport();
                    };
                  });
                };
                askPassword();
              } else {
                console.log(lang.index.error1.red);
                askEmail();
              };
            });
          };
          askEmail();
        };
      } catch (error) {
        console.log("❌ The language does not exist.".red);
        askLanguage();
      };
    });
  };
  askLanguage();
})();