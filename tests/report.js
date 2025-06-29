const box = require('../functions/report.js');
const agent = require('../functions/user-agent.js');

(() => {
  box({
    username: "",
    password: "",
    usernameReport: "",
    userAgent: agent(),
    email: "",
  });
})();