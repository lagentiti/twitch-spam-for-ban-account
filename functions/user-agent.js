module.exports = () => {
  const androidDevices = [
    'SM-G998B', 'Pixel 7', 'Pixel 6 Pro', 'SM-A525F', 'Redmi Note 10', 'OnePlus 9', 'Xperia 5 III', 'Moto G Power',
    'Galaxy S23', 'Poco X3 Pro', 'Huawei P40', 'Oppo Reno 6', 'Vivo V21', 'Nokia G50', 'Realme GT'
  ];

  const userAgentTemplates = [
    { weight: 0.3, template: 'Mozilla/5.0 (Windows NT {windowsVersion}.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chromeVersion}.0.{build}.0 Safari/537.36' },
    { weight: 0.2, template: 'Mozilla/5.0 (Macintosh; Intel Mac OS X {macVersion}_{macMinor}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chromeVersion}.0.{build}.0 Safari/537.36' },
    { weight: 0.1, template: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chromeVersion}.0.{build}.0 Safari/537.36' },
    { weight: 0.15, template: 'Mozilla/5.0 (Linux; Android {androidVersion}; {androidDevice}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chromeVersion}.0.{build}.0 Mobile Safari/537.36' },
    { weight: 0.15, template: 'Mozilla/5.0 (Windows NT {windowsVersion}.0; Win64; x64; rv:{firefoxVersion}.0) Gecko/20100101 Firefox/{firefoxVersion}.0' },
    { weight: 0.1, template: 'Mozilla/5.0 (Macintosh; Intel Mac OS X {macVersion}_{macMinor}; rv:{firefoxVersion}.0) Gecko/20100101 Firefox/{firefoxVersion}.0' },
    { weight: 0.05, template: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:{firefoxVersion}.0) Gecko/20100101 Firefox/{firefoxVersion}.0' },
    { weight: 0.05, template: 'Mozilla/5.0 (Android {androidVersion}; Mobile; rv:{firefoxVersion}.0) Gecko/{firefoxVersion}.0 Firefox/{firefoxVersion}.0' },
    { weight: 0.05, template: 'Mozilla/5.0 (Macintosh; Intel Mac OS X {macVersion}_{macMinor}) AppleWebKit/605.1.{safariMinor} (KHTML, like Gecko) Version/{safariVersion}.0 Safari/605.1.{safariMinor}' },
    { weight: 0.05, template: 'Mozilla/5.0 (iPhone; CPU iPhone OS {iosVersion}_0 like Mac OS X) AppleWebKit/605.1.{safariMinor} (KHTML, like Gecko) Version/{safariVersion}.0 Mobile/15E148 Safari/604.1' },
    { weight: 0.05, template: 'Mozilla/5.0 (Windows NT {windowsVersion}.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chromeVersion}.0.{build}.0 Safari/537.36 Edg/{edgeVersion}.0.{build}.0' }
  ];

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const weightedRandomChoice = (templates) => {
    const totalWeight = templates.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    for (const template of templates) {
      random -= template.weight;
      if (random <= 0) return template;
    }
    return templates[0];
  };

  const template = weightedRandomChoice(userAgentTemplates).template;
  const replacements = {
    chromeVersion: randomInt(120, 130),
    firefoxVersion: randomInt(130, 140),
    safariVersion: randomInt(17, 18),
    edgeVersion: randomInt(120, 130),
    build: randomInt(1000, 9999),
    macVersion: randomInt(14, 15),
    macMinor: randomInt(0, 5),
    windowsVersion: randomInt(10, 11),
    androidVersion: randomInt(12, 15),
    iosVersion: randomInt(17, 18),
    safariMinor: randomInt(10, 99),
    androidDevice: androidDevices[randomInt(0, androidDevices.length - 1)],
  };

  const userAgent = template.replace(/{(\w+)}/g, (match, key) => {
    if (!(key in replacements)) {
      console.warn(`Placeholder ${key} non trouvé dans replacements`);
      return match;
    }
    return replacements[key];
  });

  return userAgent;
};