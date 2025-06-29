const create = require('../functions/create-twitch.js');
const random = require('../functions/random.js');
const aniv = require('../functions/anniversary.js');
const agent = require('../functions/user-agent.js');

(() => {
  create({
    username: random(16),
    password: random(32),
    email: "",
    birthDate: aniv(),
    userAgent: agent(),
  });
})();