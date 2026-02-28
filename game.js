// ── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 15;
const WORD_COUNT   = 10;

// ── STATE ─────────────────────────────────────────────────────────────────────
let allWords  = [];
let gameWords = [];
let guessed   = [];
let attempts  = MAX_ATTEMPTS;
let currentLang = 'en'; // 'en' or 'nl'

// ── BOOT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadWords('en');
});

function loadWords(lang) {
  const file = lang === 'nl' ? 'words-nl.json' : 'words.json';
  fetch(file)
    .then(r => r.json())
    .then(data => {
      allWords = data.words;
      currentLang = lang;
      updateLangToggle();
      showScreen('screen-start');
    })
    .catch(() => {
      allWords = FALLBACK_WORDS;
      currentLang = 'en';
      updateLangToggle();
      showScreen('screen-start');
    });
}

// ── LANGUAGE TOGGLE ───────────────────────────────────────────────────────────
function switchLang(lang) {
  if (lang === currentLang) return;
  loadWords(lang);
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
  void next.offsetWidth; // force reflow for animation reset
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
  if (confirm('Start a new game with fresh words?')) startGame();
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
      <div class="word-check">✓</div>
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
    // Correct guess — also consumes one attempt
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
  badge.textContent = attempts === 0 ? 'Out!' : attempts === 1 ? 'Last one!' : 'Tap to count';
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
  showScreen('screen-win');
}

function showLose(total) {
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

// ── FALLBACK WORDS (if words.json can't load) ─────────────────────────────────
const FALLBACK_WORDS = [
  "Sushi","Yoga","Karaoke","Flamingo","Volcano","Robot","Pirate","Ninja",
  "Origami","Hammock","Bungee Jumping","Quicksand","Unicorn","Brain Freeze",
  "Jet Lag","Deja vu","Ghost Hunter","Bermuda Triangle","Black Hole","Capybara",
  "Roller Coaster","Sloth","Procrastination","Surfing","Star Wars","Harry Potter",
  "Minecraft","TikTok","Emoji","WiFi","Ghosting","Meme","Astronaut","Blender",
  "Trampoline","Paragliding","Chameleon","Culture Shock","Clown","Stuntman"
];
