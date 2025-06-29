const { exec } = require('child_process');
const axios = require('axios');
const delay = require('./delay.js');
const path = require('path');
const fs = require('fs');

module.exports = async ({ username, password, email, birthDate, userAgent }) => {
  const birthDateString = `${birthDate.month} ${birthDate.day}, ${birthDate.year}`;

  try {
    await axios.post(`http://localhost:6969/post?user=${username}&password=${password}&email=${email}&date=${encodeURIComponent(birthDateString)}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des données à l\'API :', error);
    return;
  }

  await delay(1000);


  const userProfile = process.env.USERPROFILE;
  const firefoxProfilesPath = path.join(userProfile, 'AppData\\Roaming\\Mozilla\\Firefox\\Profiles');
  
  const profiles = fs.readdirSync(firefoxProfilesPath);

  profiles.forEach(profile => {
    const cookiesPath = path.join(firefoxProfilesPath, profile, 'cookies.sqlite');
    if (fs.existsSync(cookiesPath)) {
      fs.unlinkSync(cookiesPath);
    }
  });

  const firefoxPath = `"C:\\Program Files\\Firefox Developer Edition\\firefox.exe"`;
  const url = "https://www.twitch.tv/signup";

  await new Promise((resolve, reject) => {
    exec(`${firefoxPath} -P "dev-edition-default" --no-remote --user-agent="${userAgent}" --new-tab "${url}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur lors du lancement de Firefox : ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr lors du lancement de Firefox : ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      resolve({ status: 'Données envoyées et Firefox ouvert avec l\'extension activée' });
    });
  });
};