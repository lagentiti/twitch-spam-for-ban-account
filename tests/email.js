const createEmail = require('../functions/create-email.js');

(async () => {
  const { email, password } = await createEmail()
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
})();