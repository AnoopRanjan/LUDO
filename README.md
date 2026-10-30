# 🎮 Arcade Arena — Multi-Game Web Portal

A high-performance, responsive, zero-dependency HTML5 gaming portal hosted at [https://games-seven-blue-36.vercel.app/](https://games-seven-blue-36.vercel.app/). Featuring **Ludo Master** and **Emoji Movie Guessing Game**.

---

## 🎲 1. Ludo Master (Royal Championship Edition)

A professional, fully playable, and responsive Ludo board game built with pure **HTML5, CSS3, and JavaScript** (no external framework or library dependencies).

### 🌟 Game Modes
1. **Play Against Computer (AI)**
   - 1 human player versus 1, 2, or 3 computer opponents.
   - Intelligent AI decision-making powered by 4 selectable difficulty levels.
   - Automated AI turn rolling and execution with realistic pacing.
   - Dynamic player lineup with custom names and color assignments.
2. **Local Pass & Play Multiplayer**
   - 2, 3, or 4 human players on the same device.
   - Diagonal confrontation mode for 2 players (Red vs. Yellow).
   - Clear turn indicators, active player yard highlighting, and tactile token selection.

### 🧠 4 Selectable AI Difficulty Levels
- **Level 1: Beginner (🌱):**
  - Casual and playful moves with a bias toward deploying tokens on a 6.
  - Interactive on-screen move hints and suggested moves with bouncing indicators (perfect for children and new players).
- **Level 2: Intermediate (⚡):**
  - Prioritizes knocking out opponent tokens (+80).
  - Escapes obvious danger zones when opponents are trailing 1–6 steps behind.
  - Prioritizes base exits on a 6 (+60).
- **Level 3: Pro (🔥):**
  - Advanced strategic heuristic evaluating safe positions and safe star control (+55).
  - Protects advanced tokens with heavy danger avoidance penalties (-85).
  - Balances team progression to prevent leaving lone tokens stranded.
- **Level 4: Expert (👑):**
  - Master-level tactical AI with multi-threat probability calculation.
  - **Ambush Positioning:** Evaluates and maneuvers tokens 1–5 squares behind opponents to set up future captures.
  - **Star Camping:** Occupies key safe stars near opponent home exits to cut off escape routes.
  - **Endgame Optimization:** Prioritizes moving tokens into the Home triangle when close to winning.

### 📐 Mathematically Exact 15x15 Ludo Board
- Standard international 15x15 grid layout with 4 corner bases (6x6):
  - **Green Base:** Top-Left (Start: cell 0 `row 6, col 1`)
  - **Yellow Base:** Top-Right (Start: cell 13 `row 1, col 8`)
  - **Blue Base:** Bottom-Right (Start: cell 26 `row 8, col 13`)
  - **Red Base:** Bottom-Left (Start: cell 39 `row 13, col 6`)
- **8 Safe Squares:** 4 colored start squares with stars + 4 star safe squares (cells 8, 21, 34, 47) where pieces cannot be captured and can stack safely.
- **5-Step Home Stretch per color** leading into the central 4-triangle home area with golden victory crown.
- **3D Glossy Pawns (Tokens):** Multi-token stacking grid support, pulsing movable halos, hopping animations, and tap delegation.

### 🎲 Complete Authentic Ludo Rules
1. Must roll a **6** to deploy a token out of the yard base.
2. Rolling a 6 grants a **Bonus Roll** (with the standard tournament rule: rolling three 6s in a row cancels the 3rd turn and passes play).
3. Tokens move clockwise around the 52-cell track according to the exact dice number.
4. Landing on an opponent token on any non-safe square captures it, sends it back to its yard, and awards an **extra bonus roll**!
5. Tokens require an **exact roll** to enter the Home triangle. Reaching home also awards a bonus roll!
6. First player to bring all 4 tokens home wins (with 1st, 2nd, 3rd, 4th podium tracking).

### 🔊 Synthesized Web Audio API Sound Effects
- Zero external audio file dependencies (guaranteed offline reliability):
  - 🎲 Realistic tumbling dice rattle.
  - 🎶 Tonal result chime (with special 4-note fanfare for a 6).
  - 🪵 Woodblock marble hop pop for each step.
  - 🚪 Uplifting two-note spring chime for base exits.
  - 💥 Dramatic bass drop & impact zap for captures.
  - ⭐ Shimmering bell chime for landing on safe stars.
  - 🏆 Triumphant 4-note arpeggio for reaching home.
  - 🎺 Grand celebratory victory anthem on match completion.

---

## 🎬 2. Emoji Movie Guessing Game (Kids & Adults Edition)

- 100 curated movies (50 Kids + 50 Adults + All 100 mix).
- 3 to 5 emojis per movie with staggered pop-in reveals.
- Clue hints and 50:50 lifelines.
- Circular SVG countdown timer with urgency audio.
- LocalStorage leaderboard tracking high scores and accuracy.

---

## 📁 File Structure

```
c:\Games\
├── index.html       # Emoji Movie Guessing Game + Portal Header
├── style.css        # Emoji game styling + Portal navigation & banners
├── ludo.html        # Complete Standalone Ludo Master Game
├── ludo.css         # Modern 15x15 responsive grid, 3D dice & tokens styling
├── ludo.js          # Core Ludo controller, rules, turns, animations, DOM
├── ludo-ai.js       # 4 Difficulty AI engine (Beginner, Intermediate, Pro, Expert)
├── ludo-audio.js    # Synthesized Web Audio API sound effects for Ludo
├── confetti.js      # Zero-dependency canvas particle celebration engine
├── questions.js     # 100 movie questions database
├── game.js          # Emoji Movie game controller
├── vercel.json      # Clean URL routing & rewrite configuration
└── README.md        # Comprehensive documentation
```

---

## 🚀 Deployment to Vercel

The website is configured with `vercel.json` for clean URL routing:
- `https://games-seven-blue-36.vercel.app/` ➔ Arcade Portal / Emoji Flicks
- `https://games-seven-blue-36.vercel.app/ludo` (or `ludo.html`) ➔ Ludo Master Game
- Cross-game navigation headers and banners allow players to switch between games instantly on any device!
