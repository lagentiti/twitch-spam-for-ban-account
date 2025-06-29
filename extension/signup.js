(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min) + min);

  const simulateKey = async (input, char) => {
    const keyEventOptions = { key: char, bubbles: true };
    input.dispatchEvent(new KeyboardEvent("keydown", keyEventOptions));
    input.dispatchEvent(new KeyboardEvent("keypress", keyEventOptions));
    input.value += char;
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keyup", keyEventOptions));
    await sleep(randomDelay(100, 200));
  };

  const humanClick = (element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    });
    element.dispatchEvent(clickEvent);
  };

  const clickAndType = async (inputElement, text) => {
    if (!inputElement) {
      console.error("Champ non trouvé");
      return;
    }
    console.log("Clicking and typing in:", inputElement);
    humanClick(inputElement);
    inputElement.focus();
    await sleep(300);
    for (let char of text) {
      await simulateKey(inputElement, char);
    }
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(200);
    inputElement.blur();
    document.body.click();
  };

  const waitForSelector = (selector, timeout = 15000) => {
    return new Promise((resolve, reject) => {
      const interval = 200;
      const maxTries = timeout / interval;
      let tries = 0;
      const checker = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(checker);
          resolve(el);
        }
        if (++tries > maxTries) {
          clearInterval(checker);
          reject(`Élément introuvable : ${selector}`);
        }
      }, interval);
    });
  };

  const apiUrl = "http://localhost:6969/data";
  const quitApiUrl = "http://localhost:6969/quit"; // URL pour fermer Firefox via l'API

  try {
    console.log("Récupération des données...");
    const response = await fetch(apiUrl, { mode: "cors" });
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();
    console.log("Données récupérées :", data);
    await sleep(1500);

    console.log("Recherche du bouton de soumission...");
    const submitButton = await waitForSelector(
      'button[data-a-target="signup-phone-email-toggle"]'
    );
    console.log("Bouton de soumission trouvé !");
    humanClick(submitButton);
    await sleep(2000);

    console.log('Recherche du champ "username"...');
    const usernameInput = await waitForSelector(
      'div[data-a-target="signup-username-input"] > input'
    );
    await clickAndType(usernameInput, data[0].username);

    console.log('Recherche du champ "password"...');
    const passwordInput = await waitForSelector(
      'div[data-a-target="signup-password-input"] > input'
    );
    await clickAndType(passwordInput, data[0].password);

    console.log("Mise à jour du mois de naissance...");
    const months = {
      January: "1",
      February: "2",
      March: "3",
      April: "4",
      May: "5",
      June: "6",
      July: "7",
      August: "8",
      September: "9",
      October: "10",
      November: "11",
      December: "12",
    };
    const birthdayMonthSelect = await waitForSelector(
      'select[data-a-target="birthday-month-select"]'
    );
    birthdayMonthSelect.value = months[data[0].birthDate.month];
    birthdayMonthSelect.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(1000);

    console.log("Mise à jour du jour de naissance...");
    const birthdayDaySelect = await waitForSelector(
      'select[data-a-target="birthday-date-input"]'
    );
    birthdayDaySelect.value = data[0].birthDate.day.replace(",", "");
    birthdayDaySelect.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(1000);

    console.log("Mise à jour de l'année de naissance...");
    const birthdayYearSelect = await waitForSelector(
      'select[aria-label="Select your birthday year"]'
    );
    birthdayYearSelect.value = data[0].birthDate.year;
    birthdayYearSelect.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(1000);

    console.log('Recherche du champ "email"...');
    const emailInput = await waitForSelector('input[id="email-input"]');
    await clickAndType(emailInput, data[0].email);
    await sleep(1000);

    console.log("Recherche du bouton de soumission 2...");
    const submit2Button = await waitForSelector(
      'button[data-a-target="passport-signup-button"]'
    );
    console.log("Bouton de soumission 2 trouvé !");
    humanClick(submit2Button);
    await sleep(120000);

    console.log("Envoi de la requête pour récupérer le code...");
    const codeResponse = await fetch("http://localhost:6969/mailbox", {
      mode: "cors",
    });
    if (!codeResponse.ok)
      throw new Error(`Erreur HTTP (code): ${codeResponse.status}`);
    const codeData = await codeResponse.json();
    console.log("Code récupéré :", codeData);
    const code = codeData.code;
    if (!/^\d{6}$/.test(code)) {
      console.error("Code invalide:", code);
      return;
    }

    console.log("Recherche des champs du code...");
    const codeInputs = Array.from(
      document.querySelectorAll('input[data-a-target="tw-input"]')
    ).slice(0, 6);
    if (codeInputs.length !== 6) {
      console.error(
        "Nombre d'inputs incorrect pour le code (trouvé:",
        codeInputs.length,
        ")"
      );
      return;
    }

    console.log("Taper les chiffres du code...");
    for (let i = 0; i < 6; i++) {
      await clickAndType(codeInputs[i], code[i]);
    }

    await sleep(10000)
    console.log("Code inséré :", code);

    // Appeler l'API pour fermer Firefox après la fin du script
    console.log("Fermeture de Firefox via l'API...");
    await fetch(quitApiUrl, { method: "GET" });

  } catch (error) {
    console.error("Erreur dans le script:", error);
  }

  console.log("Fin du script.");
})();
