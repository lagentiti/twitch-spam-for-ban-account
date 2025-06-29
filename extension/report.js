(async () => {
  const apiUrl = "http://localhost:6969/connection";
  const quitApiUrl = "http://localhost:6969/quit";

  console.log("Récupération des données...");
  const response = await fetch(apiUrl, { mode: "cors" });
  if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  const data = await response.json();

  // L'URL de redirection (remplace-la par celle que tu veux)
  const redirectUrl = `https://www.twitch.tv/${encodeURIComponent(data[0].usernameReport)}`;  // Remplace par l'URL de redirection souhaitée

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min) + min);

  // Fonction pour simuler la frappe au clavier (délai aléatoire entre chaque touche)
  const simulateKey = async (input, char) => {
    const keyEventOptions = { key: char, bubbles: true };
    input.dispatchEvent(new KeyboardEvent("keydown", keyEventOptions));
    input.dispatchEvent(new KeyboardEvent("keypress", keyEventOptions));
    input.value += char;
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keyup", keyEventOptions));
    await sleep(randomDelay(100, 200)); // Pause entre chaque touche
  };

  // Fonction pour simuler un clic humain (au centre de l'élément)
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

  // Fonction pour cliquer sur un élément et taper un texte
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
      await simulateKey(inputElement, char); // Simuler la frappe de chaque caractère
    }
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(200); // Délai avant de retirer le focus
    inputElement.blur();
    document.body.click(); // Désactive le focus
  };

  // Fonction d'attente pour un sélecteur (jusqu'à 15 secondes max)
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

  // Vérifier l'URL actuelle et décider de la redirection ou de l'exécution du script
  const currentUrl = window.location.href;

  // Si l'URL est ni login, signup, ni l'URL de l'utilisateur à signaler, on redirige
  if (currentUrl == redirectUrl) {
    console.log("Lancement du script pour l'utilisateur à signaler...");

    // Attendre un peu avant de commencer
    await sleep(1000);

    // Cliquer sur les boutons dans l'ordre
    await humanClick(await waitForSelector('button[data-a-target="report-button-more-button"]'));
    await sleep(1000);
    await humanClick(await waitForSelector('button[data-a-target="report-button-report-button"]'));
    await sleep(2000);
    await humanClick(await waitForSelector('input[id="content-select-radio-group-OFF_PLATFORM_REPORT"]'));
    await sleep(2000);

    // Passer à l'étape suivante du formulaire
    await humanClick(await waitForSelector('button[data-a-target="form-navigation-next"]'));

    await sleep(2000);

    console.log("Fermeture de Firefox via l'API...");
    await fetch(quitApiUrl, { method: "GET" });
  } else {
    if(currentUrl == "https://www.twitch.tv/login") return 0;
    if(currentUrl == "https://www.twitch.tv/signup") return 0;
    console.log("Redirection vers une autre page...");
    window.location = redirectUrl;  // Rediriger vers une autre URL
    return;
  }
})();
