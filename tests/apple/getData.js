const { getData } = require('../../functions/apple-mail.js');

(async () => {
  const mail = await getData("fr");
  console.log(mail);
})();