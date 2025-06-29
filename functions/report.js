const { exec } = require('child_process');
const axios = require('axios');
const delay = require('../functions/delay.js');
const path = require('path');
const fs = require('fs').promises;

module.exports = async ({ username, password, usernameReport, userAgent }) => {
  try {
    await axios.post(`http://localhost:6969/postconnection?user=${username}&password=${password}&usernameReport=${usernameReport}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des données à l\'API :', error);
    return;
  }

  await delay(1000);

  const userProfile = process.env.USERPROFILE;
  const firefoxProfilesPath = path.join(userProfile, 'AppData\\Roaming\\Mozilla\\Firefox\\Profiles');
  
  try {
    const profiles = await fs.readdir(firefoxProfilesPath);

    for (const profile of profiles) {
      const cookiesPath = path.join(firefoxProfilesPath, profile, 'cookies.sqlite');
      
      try {
        await fs.access(cookiesPath); 
        let retries = 5;
        let success = false;

        while (retries > 0 && !success) {
          try {
            await fs.unlink(cookiesPath);
            console.log(`Fichier supprimé : ${cookiesPath}`);
            success = true;
          } catch (err) {
            if (err.code === 'EBUSY') {
              await delay(2000);
              retries--;
            } else {
              console.error(err);
              retries = 0;
            };
          };
        };
      } catch (err) {
        console.log(err);
      }
    }
  } catch (error) {
    console.error(error);
  }

  const firefoxPath = `"C:\\Program Files\\Firefox Developer Edition\\firefox.exe"`;
  const url = "https://www.twitch.tv/login";

  await new Promise((resolve, reject) => {
    exec(`${firefoxPath} -P "dev-edition-default" --no-remote --user-agent="${userAgent}" --new-tab "${url}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(stderr));
        return;
      }
      resolve({ status: 'ok' });
    });
  });
};