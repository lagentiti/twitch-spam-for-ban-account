const { deleteEmail } = require('../../functions/apple-mail.js');

(async () => {
  try {
    const result = await deleteEmail({
      email: '',
      password: ''
    });
    console.log(result);
  } catch (error) {
    console.error("Erreur :", error);
  }
})();