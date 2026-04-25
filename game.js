// ── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 15;
const WORD_COUNT   = 10;

// ── I18N ──────────────────────────────────────────────────────────────────────
const I18N = {
  "en": {
    "headline": "One word.<br><em>That’s all<br>you get.</em>",
    "tagline": "Give one hint. Your team guesses. Beat the limit.",
    "rule1": "<strong>One hint word</strong> — describe the word on screen without saying it",
    "rule2": "<strong>10 words</strong> to guess — tap a word when your team gets it right",
    "rule3": "<strong>15 attempts max</strong> — the counter goes down on every guess, right or wrong",
    "rule4": "Guess <strong>all 10 words</strong> within 15 attempts to win",
    "startBtn": "Start Game →",
    "shuffleBtn": "Shuffle new words",
    "attemptsLabel": "Attempts Left",
    "tapToCount": "Tap to count",
    "lastOne": "Last one!",
    "out": "Out!",
    "newGameBtn": "🔄 New game",
    "homeBtn": "🏠 Home",
    "confirmRestart": "Start a new game with fresh words?",
    "winHeadline": "You Quipped!",
    "winSub": "All 10 words guessed. Brilliant teamwork.",
    "statWords": "Words",
    "statUsed": "Used",
    "statSpare": "Spare",
    "playAgainBtn": "Play Again →",
    "backHomeBtn": "Back to Home",
    "loseHeadline": "Out of Attempts",
    "loseSub": "You got <strong id=\"lose-guessed\">—</strong> out of 10. So close.",
    "statGuessed": "Guessed",
    "statLeft": "Left",
    "tryAgainBtn": "Try Again →",
    "backHomeBtn2": "Back to Home"
  },
  "nl": {
    "headline": "Één woord.<br><em>Meer krijg<br>je niet.</em>",
    "tagline": "Geef één hint. Je team raadt. Versla de limiet.",
    "rule1": "<strong>Één hintwoord</strong> — beschrijf het woord op het scherm zonder het te zeggen",
    "rule2": "<strong>10 woorden</strong> raden — tik op een woord als je team het goed heeft",
    "rule3": "<strong>Max 15 pogingen</strong> — de teller gaat omlaag bij elke gok, goed of fout",
    "rule4": "Raad <strong>alle 10 woorden</strong> binnen 15 pogingen om te winnen",
    "startBtn": "Start Spel →",
    "shuffleBtn": "Nieuwe woorden",
    "attemptsLabel": "Pogingen Over",
    "tapToCount": "Tik om te tellen",
    "lastOne": "Laatste!",
    "out": "Op!",
    "newGameBtn": "🔄 Nieuw spel",
    "homeBtn": "🏠 Home",
    "confirmRestart": "Nieuw spel starten met nieuwe woorden?",
    "winHeadline": "Gequipt!",
    "winSub": "Alle 10 woorden geraden. Geweldig teamwerk.",
    "statWords": "Woorden",
    "statUsed": "Gebruikt",
    "statSpare": "Over",
    "playAgainBtn": "Opnieuw Spelen →",
    "backHomeBtn": "Terug naar Home",
    "loseHeadline": "Pogingen Op",
    "loseSub": "Je had <strong id=\"lose-guessed\">—</strong> van de 10. Bijna!",
    "statGuessed": "Geraden",
    "statLeft": "Over",
    "tryAgainBtn": "Probeer Opnieuw →",
    "backHomeBtn2": "Terug naar Home"
  }
};

function t(key) {
  return I18N[currentLang]?.[key] ?? I18N.en[key] ?? key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== undefined) el.innerHTML = val;
  });
  document.title = currentLang === 'nl'
    ? 'Quip \u2014 Woordspel voor Feestjes'
    : 'Quip \u2014 Party Word Game';
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let allWords  = [];
let gameWords = [];
let guessed   = [];
let attempts  = MAX_ATTEMPTS;
let currentLang = 'en';

// ── BOOT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadWords('en', true);
  registerServiceWorker();
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

function loadWords(lang, isInitial = false) {
  const file = lang === 'nl' ? 'words-nl.json' : 'words.json';
  const fallback = lang === 'nl' ? FALLBACK_WORDS_NL : FALLBACK_WORDS;

  fetch(file)
    .then(r => {
      if (!r.ok) throw new Error('fetch failed');
      return r.json();
    })
    .then(data => {
      allWords    = data.words;
      currentLang = lang;
      updateLangToggle();
      applyI18n();
      if (isInitial) showScreen('screen-start');
    })
    .catch(() => {
      allWords    = fallback;
      currentLang = lang;
      updateLangToggle();
      applyI18n();
      if (isInitial) showScreen('screen-start');
    });
}

// ── LANGUAGE TOGGLE ───────────────────────────────────────────────────────────
function switchLang(lang) {
  if (lang === currentLang) return;
  loadWords(lang, false);
}

function updateLangToggle() {
  const btnEn = document.getElementById('lang-en');
  const btnNl = document.getElementById('lang-nl');
  if (!btnEn || !btnNl) return;
  btnEn.classList.toggle('lang-active', currentLang === 'en');
  btnNl.classList.toggle('lang-active', currentLang === 'nl');
}

// ── SCREEN ROUTING ────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const next = document.getElementById(id);
  void next.offsetWidth;
  next.classList.add('active');
}

function showStart() {
  showScreen('screen-start');
}

// ── GAME SETUP ────────────────────────────────────────────────────────────────
function startGame() {
  gameWords = shuffle(allWords).slice(0, WORD_COUNT);
  guessed   = new Array(WORD_COUNT).fill(false);
  attempts  = MAX_ATTEMPTS;

  buildWordGrid();
  buildProgressDots();
  updateAttemptsUI();
  showScreen('screen-game');
}

function confirmRestart() {
  if (confirm(t('confirmRestart'))) startGame();
}

// ── WORD GRID ─────────────────────────────────────────────────────────────────
function buildWordGrid() {
  const grid = document.getElementById('word-grid');
  grid.innerHTML = '';
  gameWords.forEach((word, i) => {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.id = `card-${i}`;
    card.innerHTML = `
      <div class="word-number">${String(i + 1).padStart(2, '0')}</div>
      <div class="word-text">${word}</div>
      <div class="word-check">&#10003;</div>
    `;
    card.addEventListener('click', () => toggleWord(i));
    grid.appendChild(card);
  });
}

function toggleWord(index) {
  guessed[index] = !guessed[index];
  const card = document.getElementById(`card-${index}`);
  card.classList.toggle('guessed', guessed[index]);

  if (guessed[index]) {
    if (navigator.vibrate) navigator.vibrate(30);
    if (attempts > 0) {
      attempts--;
      updateAttemptsUI();
      animateAttemptBtn();
    }
  }

  checkGameState();
}

// ── ATTEMPT COUNTER ───────────────────────────────────────────────────────────
function useAttempt() {
  if (attempts <= 0) return;
  attempts--;
  updateAttemptsUI();
  animateAttemptBtn();
  if (attempts === 0) setTimeout(() => checkGameState(true), 300);
}

function updateAttemptsUI() {
  const ftr    = document.getElementById('footer-attempts');
  const badge  = document.getElementById('attempt-badge');
  const btn    = document.getElementById('attempt-btn');
  const danger = attempts <= 4;

  ftr.textContent   = attempts;
  badge.textContent = attempts === 0 ? t('out') : attempts === 1 ? t('lastOne') : t('tapToCount');
  btn.classList.toggle('danger', danger);
  updateProgressDots();
}

function animateAttemptBtn() {
  const btn    = document.getElementById('attempt-btn');
  const ripple = document.createElement('div');
  ripple.className = 'attempt-ripple';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// ── PROGRESS DOTS ─────────────────────────────────────────────────────────────
function buildProgressDots() {
  const wrap = document.getElementById('progress-dots');
  wrap.innerHTML = '';
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const dot = document.createElement('div');
    dot.className = 'prog-dot';
    dot.id = `dot-${i}`;
    wrap.appendChild(dot);
  }
}

function updateProgressDots() {
  const used   = MAX_ATTEMPTS - attempts;
  const danger = attempts <= 4;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) continue;
    dot.className = 'prog-dot';
    if (i < used - 1)        dot.classList.add(danger ? 'danger-used' : 'used');
    else if (i === used - 1) dot.classList.add(danger ? 'danger-used' : 'used-recent');
  }
}

// ── WIN / LOSE ────────────────────────────────────────────────────────────────
function checkGameState(forceFail = false) {
  const total = guessed.filter(Boolean).length;
  if (total === WORD_COUNT) {
    setTimeout(() => showWin(total), 380);
    return;
  }
  if (forceFail || attempts === 0) {
    setTimeout(() => showLose(total), 300);
  }
}

function showWin(total) {
  document.getElementById('win-words').textContent    = total;
  document.getElementById('win-attempts').textContent = MAX_ATTEMPTS - attempts;
  document.getElementById('win-left').textContent     = attempts;
  if (navigator.vibrate) navigator.vibrate([40, 20, 60, 20, 80]);
  applyI18n();
  showScreen('screen-win');
}

function showLose(total) {
  applyI18n();
  document.getElementById('lose-guessed').textContent    = total;
  document.getElementById('lose-words-stat').textContent = total;
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  showScreen('screen-lose');
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── FALLBACK WORDS EN ─────────────────────────────────────────────────────────
const FALLBACK_WORDS = [
  "Sushi","Yoga","Karaoke","Flamingo","Volcano","Robot","Pirate","Ninja",
  "Origami","Hammock","Quicksand","Unicorn","Brain Freeze","Capybara",
  "Roller Coaster","Sloth","Procrastination","Surfing","Star Wars","Harry Potter",
  "Minecraft","TikTok","Emoji","WiFi","Ghosting","Meme","Astronaut","Blender",
  "Trampoline","Paragliding","Chameleon","Culture Shock","Clown","Stuntman"
];

// ── FALLBACK WORDS NL ─────────────────────────────────────────────────────────
const FALLBACK_WORDS_NL = [
  "Fiets","Kaas","Stroopwafel","Windmolen","Tulp","Klompen","Hagelslag","Polder",
  "Gracht","Gezellig","Oliebollen","Kroket","Stamppot","Frikandel","Pannenkoek","Hutspot",
  "Erwtensoep","Bitterballen","Rookworst","Poffertjes","Ontbijt","Middageten","Avondeten","Brood",
  "Boter","Melk","Koffie","Thee","Water","Bier","Wijn","Sap",
  "Suiker","Zout","Peper","Rijst","Aardappel","Groente","Fruit","Vlees",
  "Kip","Vis","Ei","Soep","Salade","Taart","Koekje","Chocolade",
  "Ijs","Friet","Huis","Woning","Kamer","Keuken","Badkamer","Slaapkamer",
  "Woonkamer","Tuin","Balkon","Deur","Raam","Trap","Muur","Vloer",
  "Plafond","Dak","Schoorsteen","Kelder","Zolder","Garage","Sleutel","Tafel",
  "Stoel","Bank","Bed","Kast","Spiegel","Lamp","Klok","Gordijn",
  "Tapijt","Kussen","Deken","Handdoek","Zeep","Tandenborstel","Tandpasta","Douche",
  "Kraan","Wasmachine","Stofzuiger","Koelkast","Magnetron","Oven","Fornuis","Vaatwasser",
  "Bord","Glas","Kopje","Mes","Vork","Lepel","Pan","Schaal",
  "Werk","Kantoor","Baas","Collega","Vergadering","Salaris","Vakantie","Pauze",
  "Computer","Bureau","Printer","Telefoon","Sollicitatie","Contract","Overwerk","Pensioen",
  "School","Leraar","Leerling","Student","Huiswerk","Examen","Diploma","Boek",
  "Schrift","Pen","Potlood","Gum","Liniaal","Rugzak","Bril","Woordenboek",
  "Bibliotheek","Hoofd","Haar","Gezicht","Oog","Oor","Neus","Mond",
  "Tand","Lip","Kin","Wang","Voorhoofd","Nek","Schouder","Arm",
  "Elleboog","Pols","Hand","Vinger","Duim","Nagel","Borst","Buik",
  "Rug","Heup","Been","Knie","Enkel","Voet","Teen","Hart",
  "Longen","Bloed","Bot","Spier","Huid","Ziekenhuis","Dokter","Apotheek",
  "Medicijn","Recept","Verband","Koorts","Griep","Verkoudheid","Hoofdpijn","Buikpijn",
  "Allergie","Pleister","Hoesten","Niezen","Jas","Broek","Shirt","Trui",
  "Jurk","Rok","Sokken","Schoenen","Laarzen","Sjaal","Muts","Handschoenen",
  "Riem","Rits","Knoop","Zak","Mouw","Kraag","Ondergoed","Pyjama",
  "Badjas","Pantoffels","Paraplu","Hond","Kat","Konijn","Hamster","Vogel",
  "Papegaai","Paard","Koe","Varken","Schaap","Geit","Eend","Gans",
  "Zwaan","Muis","Rat","Spin","Vlinder","Bij","Wesp","Mug",
  "Vlieg","Mier","Slang","Kikker","Schildpad","Aap","Olifant","Leeuw",
  "Tijger","Beer","Wolf","Vos","Hert","Haas","Egel","Uil",
  "Adelaar","Dolfijn","Walvis","Haai","Krab","Zon","Maan","Ster",
  "Wolk","Regen","Sneeuw","Hagel","Wind","Storm","Onweer","Bliksem",
  "Donder","Regenboog","Mist","Vorst","Boom","Bloem","Gras","Blad",
  "Tak","Wortel","Struik","Bos","Berg","Dal","Rivier","Meer",
  "Zee","Strand","Eiland","Woestijn","Vulkaan","Waterval","Grot","Klif",
  "Heuvel","Veld","Weide","Moeras","Auto","Bus","Trein","Tram",
  "Metro","Vliegtuig","Boot","Scooter","Motor","Vrachtwagen","Ambulance","Brandweer",
  "Politie","Taxi","Helikopter","Zeilboot","Veerboot","Station","Halte","Luchthaven",
  "Parkeerplaats","Snelweg","Rotonde","Verkeerslicht","Zebrapad","Brug","Tunnel","Stad",
  "Dorp","Straat","Plein","Park","Markt","Winkel","Supermarkt","Bakker",
  "Slager","Restaurant","Café","Hotel","Museum","Bioscoop","Theater","Kerk",
  "Moskee","Stadhuis","Postkantoor","Brandweerkazerne","Politiebureau","Gevangenis","Flat","Wolkenkrabber",
  "Kasteel","Paleis","Toren","Molen","Boerderij","Schuur","Fontein","Standbeeld",
  "Monument","Speeltuin","Voetbal","Tennis","Zwemmen","Hardlopen","Fietsen","Schaatsen",
  "Skiën","Surfen","Dansen","Boksen","Volleybal","Hockey","Basketbal","Badminton",
  "Gymnastiek","Wedstrijd","Kampioen","Medaille","Scheidsrechter","Schilderen","Tekenen","Fotografie",
  "Tuinieren","Koken","Bakken","Breien","Naaien","Puzzel","Bordspel","Kaarten",
  "Schaken","Dammen","Gitaar","Piano","Viool","Drums","Fluit","Concert",
  "Festival","Feest","Verjaardag","Bruiloft","Kerst","Sinterklaas","Koningsdag","Carnaval",
  "Blij","Verdrietig","Boos","Bang","Moe","Honger","Dorst","Ziek",
  "Gezond","Zenuwachtig","Trots","Jaloers","Eenzaam","Verliefd","Teleurgesteld","Opgewonden",
  "Verveeld","Geschrokken","Dankbaar","Schuldig","Moeder","Vader","Zoon","Dochter",
  "Broer","Zus","Opa","Oma","Oom","Tante","Neef","Nicht",
  "Buurman","Buurvrouw","Vriend","Vriendin","Tweeling","Baby","Kleinkind","Stiefmoeder",
  "Geld","Pinpas","Contant","Korting","Aanbieding","Kassa","Bon","Prijs",
  "Rekening","Fooi","Belasting","Hypotheek","Huur","Verzekering","Boodschappen","Portemonnee",
  "Munt","Briefje","Spaarrekening","Schuld","Smartphone","Laptop","Tablet","Koptelefoon",
  "Oplader","Wachtwoord","Wifi","Internet","Scherm","Toetsenbord","Camera","Selfie",
  "Bericht","Koffer","Paspoort","Visum","Instapkaart","Douane","Bagage","Landkaart",
  "Reisgids","Camping","Huisje","Terras","Snijplank","Vergiet","Garde","Spatel",
  "Schort","Deegroller","Theedoek","Aanrecht","Maandag","Dinsdag","Woensdag","Donderdag",
  "Vrijdag","Zaterdag","Zondag","Lente"
];
