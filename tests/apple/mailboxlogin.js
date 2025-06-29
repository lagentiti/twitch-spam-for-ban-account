const { mailboxLogin } = require('../../functions/apple-mail.js');

(async () => {
  const mail = await mailboxLogin({
    email: "",
    password: ""
  });
  console.log(mail);
})();