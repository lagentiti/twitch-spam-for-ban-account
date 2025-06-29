const { createEmail } = require('../../functions/apple-mail.js');

(async () => {
  const mail = await createEmail();
  console.log(mail);
})();