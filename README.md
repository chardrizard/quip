# Quip 🟡

> *One word. That's all you get.*

A mobile-first party word guessing game. Give one-word hints, guess 10 words, use at most 15 attempts total.

**[▶ Play it live](https://YOUR-USERNAME.github.io/quip)**

---

## How to play

1. One player sees the 10 words on screen — they are the **hint giver**
2. For each word, they give exactly **one hint word** — no gestures, no sentences
3. When the team guesses a word correctly, **tap that word** to cross it out *(uses 1 attempt)*
4. For wrong guesses, **tap the yellow counter** at the bottom *(uses 1 attempt)*
5. Guess all **10 words within 15 attempts total** to win 🏆

---

## File structure

```
quip/
├── index.html        ← game UI and all screens
├── style.css         ← Quip design system
├── game.js           ← all game logic
├── manifest.json     ← PWA manifest
├── words.json        ← 200-word international pool
├── icons/
│   ├── favicon.ico           ← multi-size favicon
│   ├── favicon.svg           ← vector favicon
│   ├── apple-touch-icon.png  ← iOS home screen icon
│   ├── icon-192.png          ← PWA icon
│   ├── icon-512.png          ← PWA icon
│   ├── icon-maskable-512.png ← PWA maskable icon
│   └── og-image.png          ← social share image
└── README.md
```

---

## Customising the word list

Edit `words.json` — the game picks 10 random words per round from the pool.

```json
{
  "words": [
    "Sushi",
    "Volcano",
    "Your Custom Word"
  ]
}
```

No build step needed.

---

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Source: `main` branch, `/ (root)` folder
4. Live at `https://YOUR-USERNAME.github.io/REPO-NAME`

> **Local file note:** Opening `index.html` directly via `file://` will fail to load `words.json` due to browser security. The game automatically falls back to a built-in word list in that case. To test properly locally, run a dev server:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

---

## Install as app (PWA)

On mobile: open in browser → share → **Add to Home Screen**. Plays fullscreen like a native app.

---

## License

MIT — free to use, fork, and remix.
