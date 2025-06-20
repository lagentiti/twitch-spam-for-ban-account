const creatememail = require('./functions/create-email.js');
const createtwitch = require('./functions/create-twitch.js');

(() => {
  creatememail().then(rsp => {
    if (rsp.code !== null) {
      createtwitch({
        email: rsp.email,
        password: rsp.password,
        username: rsp.email.split('@')[0],
        birthdate: {
          month: 'January',
          day: '1',
          year: '2000'
        }
      }).then(twitchRsp => {
        if (twitchRsp.code !== 0) {
          
        } else {
          return console.error("Failed to create Twitch account.");
        };
      });
    } else {
      return console.error("Failed to create email.");
    };
  });
})();