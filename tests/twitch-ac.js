const create = require('../functions/create-twitch.js');

(() => {
  create({
    username: '',
    password: '',
    email: '',
    birthDate: {
      month: 'January',
      day: '1',
      year: '2000'
    }
  });
})();