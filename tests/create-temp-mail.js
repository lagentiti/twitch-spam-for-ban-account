const mail = require('../functions/temp-mail.js');

(async () => {
  console.log("email " + await mail.generateTempEmail());
})();