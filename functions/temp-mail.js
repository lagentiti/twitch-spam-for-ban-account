const axios = require('axios');

const baseURL = 'https://api.guerrillamail.com/ajax.php';

// Fonction pour générer un email temporaire
module.exports.generateTempEmail = async () => {
  try {
    // Obtenir un email temporaire
    const response = await axios.get(baseURL, {
      params: {
        f: 'get_email_address',
        email_id: new Date().getTime(),  // générer un email unique
      },
    });

    if (response.data && response.data.email_addr) {
      return response.data.email_addr;
    } else {
      throw new Error('Erreur lors de la génération de l\'email temporaire');
    }
  } catch (error) {
    console.error("Erreur lors de l\'appel API : ", error);
    return null;
  }
};

// Fonction pour récupérer les emails reçus à l'adresse temporaire
module.exports.getEmails = async (emailAddr) => {
  try {
    // Récupérer les emails reçus pour cet email
    const response = await axios.get(baseURL, {
      params: {
        f: 'view_email',
        email_id: emailAddr.split('@')[0], // ID de l'email, partie avant le @
        seq: 1, // Séquence de la boîte de réception
      },
    });

    if (response.data && response.data.messages && response.data.messages.length > 0) {
      return response.data.messages;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des emails : ", error);
    return [];
  }
};
