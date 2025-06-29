const { mailbox } = require('../../functions/apple-mail.js');

(async () => {
  const mail = await mailbox({
    email: "",
    password: ""
  });
  console.log(mail);
})();