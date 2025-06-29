const { deleteEmail } = require('../../functions/apple-mail.js');

(async () => {
  const mail = await deleteEmail("fr");
  console.log(mail);
})();