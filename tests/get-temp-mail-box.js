const mail = require('../functions/temp-mail.js');

(async () => {
  let box = await mail.getEmails("zvyeuuxd@guerrillamailblock.com");
  if (box.length > 0) {
    console.log("Boîte de réception :");
    box.forEach((email, index) => {
      console.log(`${index + 1}. Sujet : ${email.subject} | De : ${email.from}`);
    });
  } else {
    console.log("Aucun email reçu.");
  };
})();