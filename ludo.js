/**
 * Ludo Master - Core Game Controller
 * Fully implements standard international Ludo rules, 15x15 board geometry,
 * turn management, 3D dice rolling, step-by-step animations, sound triggers,
 * and AI opponent integration.
 */

class LudoGameController {
  constructor() {
    // 52 Outer Track Coordinates in clockwise order (Green Start = 0)
    this.OUTER_TRACK_COORDS = [
      { r: 6, c: 1 },  // 0: Green Start [SAFE]
      { r: 6, c: 2 },  // 1
      { r: 6, c: 3 },  // 2
      { r: 6, c: 4 },  // 3
      { r: 6, c: 5 },  // 4
      { r: 5, c: 6 },  // 5
      { r: 4, c: 6 },  // 6
      { r: 3, c: 6 },  // 7
      { r: 2, c: 6 },  // 8: Star 1 [SAFE]
      { r: 1, c: 6 },  // 9
      { r: 0, c: 6 },  // 10
      { r: 0, c: 7 },  // 11
      { r: 0, c: 8 },  // 12
      { r: 1, c: 8 },  // 13: Yellow Start [SAFE]
      { r: 2, c: 8 },  // 14
      { r: 3, c: 8 },  // 15
      { r: 4, c: 8 },  // 16
      { r: 5, c: 8 },  // 17
      { r: 6, c: 9 },  // 18
      { r: 6, c: 10 }, // 19
      { r: 6, c: 11 }, // 20
      { r: 6, c: 12 }, // 21: Star 2 [SAFE]
      { r: 6, c: 13 }, // 22
      { r: 6, c: 14 }, // 23
      { r: 7, c: 14 }, // 24
      { r: 8, c: 14 }, // 25
      { r: 8, c: 13 }, // 26: Blue Start [SAFE]
      { r: 8, c: 12 }, // 27
      { r: 8, c: 11 }, // 28
      { r: 8, c: 10 }, // 29
      { r: 8, c: 9 },  // 30
      { r: 9, c: 8 },  // 31
      { r: 10, c: 8 }, // 32
      { r: 11, c: 8 }, // 33
      { r: 12, c: 8 }, // 34: Star 3 [SAFE]
      { r: 13, c: 8 }, // 35
      { r: 14, c: 8 }, // 36
      { r: 14, c: 7 }, // 37
      { r: 14, c: 6 }, // 38
      { r: 13, c: 6 }, // 39: Red Start [SAFE]
      { r: 12, c: 6 }, // 40
      { r: 11, c: 6 }, // 41
      { r: 10, c: 6 }, // 42
      { r: 9, c: 6 },  // 43
      { r: 8, c: 5 },  // 44
      { r: 8, c: 4 },  // 45
      { r: 8, c: 3 },  // 46
      { r: 8, c: 2 },  // 47: Star 4 [SAFE]
      { r: 8, c: 1 },  // 48
      { r: 8, c: 0 },  // 49
      { r: 7, c: 0 },  // 50
      { r: 6, c: 0 }   // 51
    ];

    // Home Stretches per color (5 steps each: step 51 to 55)
    this.HOME_STRETCH_COORDS = {
      green: [
        { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }
      ],
      yellow: [
        { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }
      ],
      blue: [
        { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }
      ],
      red: [
        { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }
      ]
    };

    // Safe Squares Indices on the Outer Track
    this.SAFE_OUTER_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];
    this.STAR_OUTER_INDICES = [8, 21, 34, 47];

    // Color Configurations
    this.COLOR_CONFIG = {
      red: {
        id: "red",
        name: "Red",
        startIndex: 39,
        hex: "#EF4444",
        glow: "rgba(239, 68, 68, 0.45)",
        homeTriangleClass: "triangle-red",
        yardClass: "yard-red"
      },
      green: {
        id: "green",
        name: "Green",
        startIndex: 0,
        hex: "#10B981",
        glow: "rgba(16, 185, 129, 0.45)",
        homeTriangleClass: "triangle-green",
        yardClass: "yard-green"
      },
      yellow: {
        id: "yellow",
        name: "Yellow",
        startIndex: 13,
        hex: "#F59E0B",
        glow: "rgba(245, 158, 11, 0.45)",
        homeTriangleClass: "triangle-yellow",
        yardClass: "yard-yellow"
      },
      blue: {
        id: "blue",
        name: "Blue",
        startIndex: 26,
        hex: "#3B82F6",
        glow: "rgba(59, 130, 246, 0.45)",
        homeTriangleClass: "triangle-blue",
        yardClass: "yard-blue"
      }
    };

    // Game Setup State
    this.gameMode = "ai"; // 'ai' or 'multiplayer'
    this.difficulty = "intermediate"; // 'beginner', 'intermediate', 'pro', 'expert'
    this.playerCount = 4;
    this.animationSpeed = 1; // 1x, 2x, 3x
    this.showHints = true;

    // Active Match State
    this.players = [];
    this.activePlayerIndex = 0;
    this.diceValue = null;
    this.diceRolled = false;
    this.isRolling = false;
    this.isMoving = false;
    this.podiumRanks = [];
    this.isGameOver = false;
    this.matchTurnCount = 0;

    // Confetti Engine
    this.confetti = window.ConfettiEngine ? new ConfettiEngine("confetti-canvas") : null;

    // Cache DOM Elements
    this.initDOMElements();
    this.bindSetupEvents();
    this.bindGameplayEvents();

    // Initial setup render
    this.updateSetupRoster();
  }

  initDOMElements() {
    // Screens
    this.screenSetup = document.getElementById("screen-setup");
    this.screenGameplay = document.getElementById("screen-gameplay");

    // Setup controls
    this.modeButtons = document.querySelectorAll(".mode-option-btn");
    this.diffButtons = document.querySelectorAll(".diff-card-btn");
    this.countButtons = document.querySelectorAll(".count-btn");
    this.rosterContainer = document.getElementById("setup-roster-list");
    this.btnStartGame = document.getElementById("btn-start-game");
    this.btnShowRules = document.getElementById("btn-show-rules");

    // Board & Gameplay
    this.boardWrapper = document.getElementById("board-wrapper");
    this.boardGrid = document.getElementById("ludo-board-grid");
    this.diceCube = document.getElementById("dice-cube");
    this.btnRollDice = document.getElementById("btn-roll-dice");
    this.diceStatusCallout = document.getElementById("dice-status-callout");
    this.turnPlayerAvatar = document.getElementById("turn-player-avatar");
    this.turnPlayerName = document.getElementById("turn-player-name");
    this.turnInstruction = document.getElementById("turn-instruction");
    this.gameLogPill = document.getElementById("game-log-pill");
    this.moveHintBox = document.getElementById("move-hint-box");
    this.moveHintText = document.getElementById("move-hint-text");
    this.turnBannerCard = document.getElementById("turn-banner-card");
    this.playersHudGrid = document.getElementById("players-hud-grid");

    // Modals
    this.modalRules = document.getElementById("modal-rules");
    this.btnCloseRules = document.getElementById("btn-close-rules");
    this.btnDismissRules = document.getElementById("btn-dismiss-rules");

    this.modalVictory = document.getElementById("modal-victory");
    this.victoryWinnerName = document.getElementById("victory-winner-name");
    this.podiumRanksList = document.getElementById("podium-ranks-list");
    this.btnRematch = document.getElementById("btn-rematch");
    this.btnNewGame = document.getElementById("btn-new-game");

    // Header buttons
    this.btnSoundToggle = document.getElementById("btn-sound-toggle");
    this.soundIcon = document.getElementById("sound-icon");
    this.btnSpeedToggle = document.getElementById("btn-speed-toggle");
    this.btnHintsToggle = document.getElementById("btn-hints-toggle");
    this.btnQuitGame = document.getElementById("btn-quit-game");
  }

  /* ==========================================================================
     SETUP SCREEN LOGIC & EVENT LISTENERS
     ========================================================================== */
  bindSetupEvents() {
    // Mode Selection
    this.modeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        window.ludoAudio.playClick();
        this.modeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.gameMode = btn.dataset.mode;

        // Enable or disable difficulty buttons
        const isAI = (this.gameMode === "ai");
        this.diffButtons.forEach(db => {
          db.disabled = !isAI;
        });

        const diffHint = document.getElementById("diff-section-hint");
        if (diffHint) {
          diffHint.textContent = isAI ? "Affects AI intelligence" : "Disabled in Human Multiplayer";
        }

        this.updateSetupRoster();
      });
    });

    // Difficulty Selection
    this.diffButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        window.ludoAudio.playClick();
        this.diffButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.difficulty = btn.dataset.diff;
      });
    });

    // Player Count Selection
    this.countButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        window.ludoAudio.playClick();
        this.countButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.playerCount = parseInt(btn.dataset.count, 10);
        this.updateSetupRoster();
      });
    });

    // Start Game Button
    if (this.btnStartGame) {
      this.btnStartGame.addEventListener("click", () => {
        window.ludoAudio.playClick();
        this.startMatch();
      });
    }

    // Rules Modal Open & Close
    const openRulesModal = () => {
      window.ludoAudio.playClick();
      this.modalRules.classList.add("active");
    };

    if (this.btnShowRules) {
      this.btnShowRules.addEventListener("click", openRulesModal);
    }
    const btnRulesSetup = document.getElementById("btn-show-rules-setup");
    if (btnRulesSetup) {
      btnRulesSetup.addEventListener("click", openRulesModal);
    }

    const closeRulesModal = () => {
      window.ludoAudio.playClick();
      this.modalRules.classList.remove("active");
    };

    if (this.btnCloseRules) this.btnCloseRules.addEventListener("click", closeRulesModal);
    if (this.btnDismissRules) this.btnDismissRules.addEventListener("click", closeRulesModal);
  }

  updateSetupRoster() {
    if (!this.rosterContainer) return;

    // Standard colors based on count:
    // 2 players: Red & Yellow (classic diagonal confrontation)
    // 3 players: Red, Green, Yellow
    // 4 players: Red, Green, Yellow, Blue
    let activeColors = [];
    if (this.playerCount === 2) {
      activeColors = ["red", "yellow"];
    } else if (this.playerCount === 3) {
      activeColors = ["red", "green", "yellow"];
    } else {
      activeColors = ["red", "green", "yellow", "blue"];
    }

    this.rosterContainer.innerHTML = "";

    activeColors.forEach((colorKey, index) => {
      const cfg = this.COLOR_CONFIG[colorKey];
      const isAI = (this.gameMode === "ai" && index > 0);
      const defaultName = isAI ? `AI Bot (${cfg.name})` : `Player ${index + 1}`;

      const row = document.createElement("div");
      row.className = "roster-player-row";
      row.style.setProperty("--player-accent", cfg.hex);

      row.innerHTML = `
        <div class="roster-color-badge ${cfg.id}">${index + 1}</div>
        <input type="text" class="roster-name-input" data-color="${cfg.id}" value="${defaultName}" maxlength="16" placeholder="Enter name">
        <span class="roster-type-pill ${isAI ? 'ai' : 'human'}">${isAI ? '🤖 AI' : '👤 Human'}</span>
      `;

      this.rosterContainer.appendChild(row);
    });
  }

  /* ==========================================================================
     GAMEPLAY CONTROLS & EVENT LISTENERS
     ========================================================================== */
  bindGameplayEvents() {
    // Roll Dice Button
    if (this.btnRollDice) {
      this.btnRollDice.addEventListener("click", () => {
        this.triggerDiceRoll();
      });
    }

    // Clicking 3D Dice itself
    if (this.diceCube) {
      this.diceCube.addEventListener("click", () => {
        if (!this.btnRollDice.disabled) {
          this.triggerDiceRoll();
        }
      });
    }

    // Keyboard Spacebar to Roll
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && this.screenGameplay.classList.contains("active")) {
        if (!this.btnRollDice.disabled && !this.isRolling && !this.isMoving) {
          e.preventDefault();
          this.triggerDiceRoll();
        }
      }
    });

    // Sound Toggle
    if (this.btnSoundToggle) {
      this.btnSoundToggle.addEventListener("click", () => {
        const isMuted = window.ludoAudio.toggleMute();
        this.soundIcon.textContent = isMuted ? "🔇" : "🔊";
      });
      // Initial sound state
      if (window.ludoAudio.isMuted) {
        this.soundIcon.textContent = "🔇";
      }
    }

    // Animation Speed Toggle (1x -> 2x -> 3x)
    if (this.btnSpeedToggle) {
      this.btnSpeedToggle.addEventListener("click", () => {
        window.ludoAudio.playClick();
        if (this.animationSpeed === 1) {
          this.animationSpeed = 2;
          this.btnSpeedToggle.textContent = "⚡ Speed 2x";
          this.btnSpeedToggle.classList.add("active");
        } else if (this.animationSpeed === 2) {
          this.animationSpeed = 3;
          this.btnSpeedToggle.textContent = "🚀 Speed 3x";
          this.btnSpeedToggle.classList.add("active");
        } else {
          this.animationSpeed = 1;
          this.btnSpeedToggle.textContent = "⏱️ Speed 1x";
          this.btnSpeedToggle.classList.remove("active");
        }
      });
    }

    // Hints Toggle
    if (this.btnHintsToggle) {
      this.btnHintsToggle.addEventListener("click", () => {
        window.ludoAudio.playClick();
        this.showHints = !this.showHints;
        this.btnHintsToggle.classList.toggle("active", this.showHints);
        this.moveHintBox.style.display = this.showHints ? "flex" : "none";
      });
    }

    // Quit to Setup Menu
    if (this.btnQuitGame) {
      this.btnQuitGame.addEventListener("click", () => {
        if (confirm("Are you sure you want to quit the current game?")) {
          window.ludoAudio.playClick();
          this.screenGameplay.classList.remove("active");
          this.screenSetup.classList.add("active");
        }
      });
    }

    // Victory Rematch & New Game
    if (this.btnRematch) {
      this.btnRematch.addEventListener("click", () => {
        window.ludoAudio.playClick();
        this.modalVictory.classList.remove("active");
        this.startMatch();
      });
    }

    if (this.btnNewGame) {
      this.btnNewGame.addEventListener("click", () => {
        window.ludoAudio.playClick();
        this.modalVictory.classList.remove("active");
        this.screenGameplay.classList.remove("active");
        this.screenSetup.classList.add("active");
      });
    }
  }

  /* ==========================================================================
     MATCH INITIALIZATION & BOARD RENDERING
     ========================================================================== */
  startMatch() {
    // Parse Player Names and create player objects
    const nameInputs = this.rosterContainer.querySelectorAll(".roster-name-input");
    this.players = [];

    nameInputs.forEach((input, index) => {
      const colorKey = input.dataset.color;
      const cfg = this.COLOR_CONFIG[colorKey];
      const isAI = (this.gameMode === "ai" && index > 0);
      const playerName = input.value.trim() || (isAI ? `AI Bot (${cfg.name})` : `Player ${index + 1}`);

      // 4 Tokens for each player
      const tokens = [0, 1, 2, 3].map(slotIdx => ({
        id: `${colorKey}-${slotIdx}`,
        color: colorKey,
        slotIndex: slotIdx,
        step: -1, // -1 means in yard base; 0..50 outer track; 51..55 home stretch; 56 home goal
        state: "yard" // 'yard', 'track', 'home_stretch', 'home'
      }));

      this.players.push({
        id: colorKey,
        name: playerName,
        color: colorKey,
        colorHex: cfg.hex,
        glowHex: cfg.glow,
        startIndex: cfg.startIndex,
        isAI: isAI,
        difficulty: isAI ? this.difficulty : null,
        tokens: tokens,
        consecutiveSixes: 0,
        rank: null,
        stats: {
          captures: 0,
          sixes: 0,
          rolls: 0
        }
      });
    });

    // Reset Match state
    this.activePlayerIndex = 0;
    this.diceValue = null;
    this.diceRolled = false;
    this.isRolling = false;
    this.isMoving = false;
    this.podiumRanks = [];
    this.isGameOver = false;
    this.matchTurnCount = 0;

    // Render Board Grid
    this.renderBoard();
    this.renderHUD();

    // Switch screen
    this.screenSetup.classList.remove("active");
    this.screenGameplay.classList.add("active");

    // Start Turn 1
    this.startTurn();
  }

  renderBoard() {
    this.boardGrid.innerHTML = "";

    // 1. Four Base Yards (6x6 each in CSS grid)
    const yards = [
      { id: "green", class: "yard-green" },
      { id: "yellow", class: "yard-yellow" },
      { id: "blue", class: "yard-blue" },
      { id: "red", class: "yard-red" }
    ];

    yards.forEach(y => {
      const yardEl = document.createElement("div");
      yardEl.className = `yard ${y.class}`;
      yardEl.id = `yard-${y.id}`;

      yardEl.innerHTML = `
        <div class="yard-inner">
          <div class="yard-slot" id="slot-${y.id}-0"></div>
          <div class="yard-slot" id="slot-${y.id}-1"></div>
          <div class="yard-slot" id="slot-${y.id}-2"></div>
          <div class="yard-slot" id="slot-${y.id}-3"></div>
        </div>
      `;

      // Yard slot click delegation for easy mobile tapping
      yardEl.querySelectorAll(".yard-slot").forEach(slot => {
        slot.addEventListener("click", () => {
          const movableTokenEl = slot.querySelector(".ludo-token.movable");
          if (movableTokenEl) movableTokenEl.click();
        });
      });

      this.boardGrid.appendChild(yardEl);
    });

    // 2. Central Home Area (rows 7-9, cols 7-9 in 1-based index)
    const centerHome = document.createElement("div");
    centerHome.className = "center-home";
    centerHome.id = "center-home-area";
    centerHome.innerHTML = `
      <div class="home-triangle triangle-green"></div>
      <div class="home-triangle triangle-yellow"></div>
      <div class="home-triangle triangle-blue"></div>
      <div class="home-triangle triangle-red"></div>
      <div class="center-trophy">👑</div>
      <div class="center-finished-container" id="center-finished-container">
        <span class="finished-badge finished-green" id="finished-count-green"></span>
        <span class="finished-badge finished-yellow" id="finished-count-yellow"></span>
        <span class="finished-badge finished-blue" id="finished-count-blue"></span>
        <span class="finished-badge finished-red" id="finished-count-red"></span>
      </div>
    `;
    this.boardGrid.appendChild(centerHome);

    // 3. Track Cells (52 Outer Track cells + 20 Home Stretch cells = 72 cells)
    // 52 Outer Track Cells
    this.OUTER_TRACK_COORDS.forEach((coord, idx) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.gridRow = `${coord.r + 1}`;
      cell.style.gridColumn = `${coord.c + 1}`;
      cell.id = `cell-outer-${idx}`;

      // Start squares
      if (idx === 0) cell.classList.add("start-green");
      if (idx === 13) cell.classList.add("start-yellow");
      if (idx === 26) cell.classList.add("start-blue");
      if (idx === 39) cell.classList.add("start-red");

      // Star Safe Squares
      if (this.STAR_OUTER_INDICES.includes(idx)) {
        cell.classList.add("safe-star");
      }

      // Container for tokens landing here
      const tokenContainer = document.createElement("div");
      tokenContainer.className = "cell-token-container";
      tokenContainer.id = `token-box-outer-${idx}`;
      cell.appendChild(tokenContainer);

      // Cell click delegation for touch friendliness
      cell.addEventListener("click", () => {
        const movableToken = cell.querySelector(".ludo-token.movable");
        if (movableToken) movableToken.click();
      });

      this.boardGrid.appendChild(cell);
    });

    // 20 Home Stretch Cells
    ["green", "yellow", "blue", "red"].forEach(color => {
      const stretch = this.HOME_STRETCH_COORDS[color];
      stretch.forEach((coord, sIdx) => {
        const cell = document.createElement("div");
        cell.className = `cell home-stretch-${color}`;
        cell.style.gridRow = `${coord.r + 1}`;
        cell.style.gridColumn = `${coord.c + 1}`;
        cell.id = `cell-home-${color}-${sIdx}`;

        const tokenContainer = document.createElement("div");
        tokenContainer.className = "cell-token-container";
        tokenContainer.id = `token-box-home-${color}-${sIdx}`;
        cell.appendChild(tokenContainer);

        // Cell click delegation
        cell.addEventListener("click", () => {
          const movableToken = cell.querySelector(".ludo-token.movable");
          if (movableToken) movableToken.click();
        });

        this.boardGrid.appendChild(cell);
      });
    });

    // Render Tokens into initial yard slots
    this.renderAllTokens();
  }

  renderHUD() {
    this.playersHudGrid.innerHTML = "";

    this.players.forEach(p => {
      const hudCard = document.createElement("div");
      hudCard.className = "hud-player-card";
      hudCard.id = `hud-card-${p.id}`;
      hudCard.style.setProperty("--player-color", p.colorHex);
      hudCard.style.setProperty("--player-glow", p.glowHex);

      hudCard.innerHTML = `
        <div class="hud-card-header">
          <span class="hud-color-dot" style="background:${p.colorHex};"></span>
          <span class="hud-player-name" title="${p.name}">${p.name}</span>
          <span class="hud-score-pill" id="hud-score-${p.id}">0/4 🏁</span>
        </div>
        <div class="hud-tokens-progress" id="hud-progress-${p.id}">
          <span class="progress-token-pip" id="pip-${p.id}-0"></span>
          <span class="progress-token-pip" id="pip-${p.id}-1"></span>
          <span class="progress-token-pip" id="pip-${p.id}-2"></span>
          <span class="progress-token-pip" id="pip-${p.id}-3"></span>
        </div>
      `;

      this.playersHudGrid.appendChild(hudCard);
    });
  }

  /* ==========================================================================
     TOKEN PLACEMENT & RENDERING
     ========================================================================== */
  renderAllTokens() {
    // Clear all token holders
    document.querySelectorAll(".cell-token-container").forEach(c => {
      c.innerHTML = "";
      c.classList.remove("multi-tokens");
    });
    document.querySelectorAll(".yard-slot").forEach(s => {
      s.innerHTML = "";
    });

    // Update finished counts on center
    ["green", "yellow", "blue", "red"].forEach(c => {
      const badge = document.getElementById(`finished-count-${c}`);
      if (badge) {
        const player = this.players.find(p => p.color === c);
        if (player) {
          const finished = player.tokens.filter(t => t.state === "home").length;
          badge.textContent = finished > 0 ? `${finished}` : "";
        }
      }
    });

    // Place every token in its correct container
    this.players.forEach(player => {
      player.tokens.forEach(token => {
        if (token.state === "yard") {
          const slot = document.getElementById(`slot-${player.color}-${token.slotIndex}`);
          if (slot) {
            slot.appendChild(this.createTokenElement(player, token));
          }
        } else if (token.state === "track") {
          const outerIdx = (player.startIndex + token.step) % 52;
          const container = document.getElementById(`token-box-outer-${outerIdx}`);
          if (container) {
            container.appendChild(this.createTokenElement(player, token));
            if (container.children.length > 1) {
              container.classList.add("multi-tokens");
            }
          }
        } else if (token.state === "home_stretch") {
          const stretchIdx = token.step - 51;
          const container = document.getElementById(`token-box-home-${player.color}-${stretchIdx}`);
          if (container) {
            container.appendChild(this.createTokenElement(player, token));
            if (container.children.length > 1) {
              container.classList.add("multi-tokens");
            }
          }
        }
      });

      // Update HUD progress
      const finishedCount = player.tokens.filter(t => t.state === "home").length;
      const scorePill = document.getElementById(`hud-score-${player.id}`);
      if (scorePill) {
        scorePill.textContent = `${finishedCount}/4 🏁`;
      }

      player.tokens.forEach((t, i) => {
        const pip = document.getElementById(`pip-${player.id}-${i}`);
        if (pip) {
          pip.className = "progress-token-pip";
          if (t.state === "home") pip.classList.add("home");
          else if (t.state === "track" || t.state === "home_stretch") pip.classList.add("active");
        }
      });
    });
  }

  createTokenElement(player, token) {
    const el = document.createElement("div");
    el.className = `ludo-token token-${player.color}`;
    el.id = `token-${token.id}`;
    el.dataset.tokenId = token.id;
    el.dataset.playerId = player.id;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleTokenClick(player, token);
    });

    return el;
  }

  /* ==========================================================================
     TURN MANAGEMENT
     ========================================================================== */
  startTurn() {
    if (this.isGameOver) return;

    const player = this.players[this.activePlayerIndex];

    // If player already finished, advance to next
    if (player.tokens.every(t => t.state === "home")) {
      this.advanceTurn();
      return;
    }

    this.matchTurnCount++;
    this.diceRolled = false;
    this.isRolling = false;
    this.isMoving = false;

    // Update Turn Banner & Highlights
    this.turnBannerCard.style.setProperty("--active-turn-color", player.colorHex);
    this.turnPlayerAvatar.style.background = player.colorHex;
    this.turnPlayerAvatar.textContent = player.isAI ? "🤖" : "👤";
    this.turnPlayerName.textContent = player.name;
    this.turnPlayerName.style.color = player.colorHex;
    this.turnInstruction.textContent = player.isAI ? "Computer is rolling..." : "Roll the dice!";
    this.diceStatusCallout.textContent = "Roll Dice!";

    // Highlight active Yard
    document.querySelectorAll(".yard").forEach(y => y.classList.remove("active-turn"));
    const activeYard = document.getElementById(`yard-${player.color}`);
    if (activeYard) activeYard.classList.add("active-turn");

    // Highlight HUD card
    document.querySelectorAll(".hud-player-card").forEach(h => h.classList.remove("active-turn"));
    const activeHud = document.getElementById(`hud-card-${player.id}`);
    if (activeHud) activeHud.classList.add("active-turn");

    // Clear previous hints and token highlights
    this.clearHighlights();

    // Human vs AI roll trigger
    if (player.isAI) {
      this.btnRollDice.disabled = true;
      const delay = Math.max(350, 700 / this.animationSpeed);
      setTimeout(() => {
        if (!this.isGameOver) this.triggerDiceRoll();
      }, delay);
    } else {
      this.btnRollDice.disabled = false;
    }
  }

  advanceTurn() {
    if (this.isGameOver) return;

    // Check if match ended (all human players finished, or only 1 player remaining)
    const unfinishedPlayers = this.players.filter(p => !p.tokens.every(t => t.state === "home"));
    if (unfinishedPlayers.length <= 1) {
      this.endGame();
      return;
    }

    // Reset consecutive sixes on normal turn change
    this.players[this.activePlayerIndex].consecutiveSixes = 0;

    // Advance to next player
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.startTurn();
  }

  /* ==========================================================================
     DICE ROLLING & EVALUATION
     ========================================================================== */
  triggerDiceRoll() {
    if (this.isRolling || this.isMoving || this.diceRolled) return;

    const player = this.players[this.activePlayerIndex];
    this.isRolling = true;
    this.btnRollDice.disabled = true;

    // Play rolling sound
    window.ludoAudio.playDiceRoll();

    // Trigger 3D dice rotation animation
    this.diceCube.classList.add("rolling");
    this.diceStatusCallout.textContent = "Rolling...";

    // Fair random roll (1 to 6)
    const rolledVal = 1 + Math.floor(Math.random() * 6);
    this.diceValue = rolledVal;
    player.stats.rolls++;
    if (rolledVal === 6) player.stats.sixes++;

    const rollDuration = Math.max(250, 500 / this.animationSpeed);

    setTimeout(() => {
      this.diceCube.classList.remove("rolling");
      this.setDiceTransform(rolledVal);
      window.ludoAudio.playDiceResult(rolledVal);

      this.diceRolled = true;
      this.isRolling = false;
      this.diceStatusCallout.textContent = `Rolled a ${rolledVal}!`;
      this.gameLogPill.textContent = `${player.name} rolled ${rolledVal}`;

      // Handle 3 Consecutive Sixes Rule
      if (rolledVal === 6) {
        player.consecutiveSixes++;
        if (player.consecutiveSixes >= 3) {
          this.gameLogPill.textContent = `⚠️ 3 Sixes in a row! Turn voided!`;
          this.turnInstruction.textContent = "3 Sixes in a row! Turn passes!";
          window.ludoAudio.playNoMove();
          player.consecutiveSixes = 0;
          setTimeout(() => this.advanceTurn(), 1200 / this.animationSpeed);
          return;
        }
      } else {
        player.consecutiveSixes = 0;
      }

      // Calculate legal moves
      const legalMoves = this.calculateLegalMoves(player, rolledVal);

      if (legalMoves.length === 0) {
        // No moves possible: pass turn
        this.turnInstruction.textContent = "No legal moves possible.";
        this.gameLogPill.textContent = "No legal moves";
        window.ludoAudio.playNoMove();

        setTimeout(() => {
          this.advanceTurn();
        }, 1000 / this.animationSpeed);
      } else {
        // Legal moves available
        if (player.isAI) {
          // AI selects and executes move
          const chosenMove = window.LudoAI.chooseMove(player, legalMoves, this.players, {
            startIndex: player.startIndex,
            safeIndices: this.SAFE_OUTER_INDICES
          });

          this.turnInstruction.textContent = `AI is moving token...`;
          const moveDelay = Math.max(300, 600 / this.animationSpeed);
          setTimeout(() => {
            this.executeMove(player, chosenMove);
          }, moveDelay);
        } else {
          // Human player: highlight movable tokens
          this.turnInstruction.textContent = "Select a highlighted token to move!";
          this.highlightMovableTokens(legalMoves, player);
        }
      }
    }, rollDuration);
  }

  setDiceTransform(value) {
    const transforms = {
      1: "rotateY(0deg) rotateX(0deg)",
      2: "rotateX(90deg) rotateY(0deg)",
      3: "rotateY(90deg) rotateX(0deg)",
      4: "rotateY(-90deg) rotateX(0deg)",
      5: "rotateX(-90deg) rotateY(0deg)",
      6: "rotateX(180deg) rotateY(0deg)"
    };
    this.diceCube.style.transform = transforms[value] || transforms[1];
  }

  /* ==========================================================================
     LEGAL MOVE CALCULATION
     ========================================================================== */
  calculateLegalMoves(player, diceVal) {
    const moves = [];

    player.tokens.forEach(token => {
      // Finished tokens cannot move
      if (token.state === "home") return;

      // Token in yard needs a 6 to exit
      if (token.state === "yard") {
        if (diceVal === 6) {
          const move = {
            token: token,
            currentStep: -1,
            targetStep: 0 // exits to start square
          };
          window.LudoAI.analyzeMove(move, player, this.players, {
            startIndex: player.startIndex,
            safeIndices: this.SAFE_OUTER_INDICES
          });
          moves.push(move);
        }
      } else {
        // Token on track or in home stretch
        const targetStep = token.step + diceVal;

        // Exact roll to enter home (step 56)
        if (targetStep <= 56) {
          const move = {
            token: token,
            currentStep: token.step,
            targetStep: targetStep
          };
          window.LudoAI.analyzeMove(move, player, this.players, {
            startIndex: player.startIndex,
            safeIndices: this.SAFE_OUTER_INDICES
          });
          moves.push(move);
        }
      }
    });

    return moves;
  }

  highlightMovableTokens(legalMoves, player) {
    this.clearHighlights();

    // Hint generator for Beginner mode or if hints are turned on
    let suggestedMove = null;
    if (this.showHints) {
      const hint = window.LudoAI.getMoveHint(legalMoves, player);
      if (hint) {
        suggestedMove = hint.move;
        this.moveHintBox.style.display = "flex";
        this.moveHintText.textContent = hint.text;
      }
    }

    legalMoves.forEach(m => {
      const tokenEl = document.getElementById(`token-${m.token.id}`);
      if (tokenEl) {
        tokenEl.classList.add("movable");
        if (suggestedMove && suggestedMove.token.id === m.token.id) {
          tokenEl.classList.add("suggested-move");
        }
      }
    });
  }

  clearHighlights() {
    document.querySelectorAll(".ludo-token").forEach(t => {
      t.classList.remove("movable", "suggested-move", "hopping");
    });
    this.moveHintBox.style.display = "none";
  }

  handleTokenClick(player, token) {
    if (player.id !== this.players[this.activePlayerIndex].id) return;
    if (player.isAI || this.isMoving || !this.diceRolled) return;

    const tokenEl = document.getElementById(`token-${token.id}`);
    if (!tokenEl || !tokenEl.classList.contains("movable")) return;

    const legalMoves = this.calculateLegalMoves(player, this.diceValue);
    const selectedMove = legalMoves.find(m => m.token.id === token.id);

    if (selectedMove) {
      this.clearHighlights();
      this.executeMove(player, selectedMove);
    }
  }

  /* ==========================================================================
     MOVE EXECUTION & STEP-BY-STEP ANIMATION
     ========================================================================== */
  executeMove(player, move) {
    this.isMoving = true;
    this.clearHighlights();

    const { token, currentStep, targetStep } = move;

    // Handle exiting Yard
    if (currentStep === -1 && targetStep === 0) {
      token.step = 0;
      token.state = "track";
      window.ludoAudio.playTokenExit();
      this.gameLogPill.textContent = `${player.name} deployed token!`;
      this.renderAllTokens();

      // Bonus roll on rolling a 6
      this.evaluateTurnEnd(player, true, false, false);
      return;
    }

    // Generate path steps for hopping animation
    const pathSteps = [];
    for (let s = currentStep + 1; s <= targetStep; s++) {
      pathSteps.push(s);
    }

    let stepIndex = 0;
    const hopInterval = Math.max(50, 110 / this.animationSpeed);

    const stepTimer = setInterval(() => {
      if (stepIndex < pathSteps.length) {
        const cur = pathSteps[stepIndex];
        token.step = cur;
        if (cur > 50 && cur < 56) token.state = "home_stretch";
        else if (cur === 56) token.state = "home";
        else token.state = "track";

        window.ludoAudio.playTokenHop();
        this.renderAllTokens();

        const tokenEl = document.getElementById(`token-${token.id}`);
        if (tokenEl) tokenEl.classList.add("hopping");

        stepIndex++;
      } else {
        clearInterval(stepTimer);
        this.handleMoveLanding(player, move);
      }
    }, hopInterval);
  }

  handleMoveLanding(player, move) {
    const { token, targetStep, captures, isSafeTarget, isReachingHome } = move;

    let hadCapture = false;
    let hadHome = false;

    // 1. Check Captures
    if (captures && captures.length > 0) {
      hadCapture = true;
      window.ludoAudio.playCapture();

      // Shake board effect
      this.boardWrapper.style.transform = "scale(0.985)";
      setTimeout(() => this.boardWrapper.style.transform = "none", 150);

      captures.forEach(cap => {
        const victimPlayer = this.players.find(p => p.id === cap.playerId);
        if (victimPlayer) {
          const victimToken = victimPlayer.tokens.find(t => t.id === cap.tokenId);
          if (victimToken) {
            victimToken.step = -1;
            victimToken.state = "yard";
            this.gameLogPill.textContent = `⚔️ ${player.name} captured ${victimPlayer.name}'s token!`;
          }
        }
      });
      player.stats.captures += captures.length;
    }

    // 2. Check Reaching Home
    if (isReachingHome) {
      hadHome = true;
      token.state = "home";
      window.ludoAudio.playHome();
      this.gameLogPill.textContent = `🏆 ${player.name} reached Home!`;
      if (this.confetti) this.confetti.burst(50);

      // Check if player has finished all 4 tokens!
      const finished = player.tokens.filter(t => t.state === "home").length;
      if (finished === 4) {
        player.rank = this.podiumRanks.length + 1;
        this.podiumRanks.push(player);
        this.gameLogPill.textContent = `🥇 ${player.name} Finished rank #${player.rank}!`;

        // Check if match is completely over
        const remaining = this.players.filter(p => !p.tokens.every(t => t.state === "home"));
        if (remaining.length <= 1) {
          this.renderAllTokens();
          setTimeout(() => this.endGame(), 800);
          return;
        }
      }
    } else if (isSafeTarget) {
      window.ludoAudio.playSafe();
    }

    this.renderAllTokens();

    // Bonus roll conditions:
    // 1. Rolled a 6 (and not voided by 3-sixes rule)
    // 2. Captured an opponent token
    // 3. Reached home goal
    const isSix = (this.diceValue === 6);
    const getsBonusRoll = isSix || hadCapture || hadHome;

    this.evaluateTurnEnd(player, getsBonusRoll, hadCapture, hadHome);
  }

  evaluateTurnEnd(player, getsBonusRoll, hadCapture, hadHome) {
    this.isMoving = false;

    if (getsBonusRoll && !this.isGameOver) {
      // Bonus Roll!
      let reason = "Rolled a 6!";
      if (hadCapture) reason = "Captured opponent!";
      else if (hadHome) reason = "Reached Home!";

      this.turnInstruction.textContent = `⭐ Bonus Roll (${reason})! Roll again!`;
      this.diceStatusCallout.textContent = "Bonus Roll!";

      this.diceRolled = false;

      if (player.isAI) {
        this.btnRollDice.disabled = true;
        const delay = Math.max(350, 700 / this.animationSpeed);
        setTimeout(() => {
          if (!this.isGameOver) this.triggerDiceRoll();
        }, delay);
      } else {
        this.btnRollDice.disabled = false;
      }
    } else {
      // Normal turn pass
      const passDelay = Math.max(250, 450 / this.animationSpeed);
      setTimeout(() => {
        this.advanceTurn();
      }, passDelay);
    }
  }

  /* ==========================================================================
     GAME OVER & VICTORY PODIUM
     ========================================================================== */
  endGame() {
    this.isGameOver = true;
    window.ludoAudio.playVictory();

    // Append remaining unfinished players to ranks
    this.players.forEach(p => {
      if (!this.podiumRanks.includes(p)) {
        p.rank = this.podiumRanks.length + 1;
        this.podiumRanks.push(p);
      }
    });

    const winner = this.podiumRanks[0];
    this.victoryWinnerName.textContent = `👑 ${winner.name} Wins!`;
    this.victoryWinnerName.style.color = winner.colorHex;

    // Render ranks in podium modal
    this.podiumRanksList.innerHTML = "";
    const badges = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place", "🎖️ 4th Place"];

    this.podiumRanks.forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = `rank-row-card ${idx === 0 ? 'first' : ''}`;
      row.style.setProperty("--player-rank-color", p.colorHex);

      row.innerHTML = `
        <div class="rank-left">
          <span class="rank-badge">${badges[idx]}</span>
          <div>
            <div class="rank-name" style="color:${p.colorHex}">${p.name} ${p.isAI ? '🤖' : '👤'}</div>
            <div class="rank-stats">Tokens Home: ${p.tokens.filter(t => t.state === 'home').length}/4 • Captures: ${p.stats.captures} • Sixes: ${p.stats.sixes}</div>
          </div>
        </div>
      `;

      this.podiumRanksList.appendChild(row);
    });

    // Confetti celebration
    if (this.confetti) {
      this.confetti.celebrate(5000);
    }

    this.modalVictory.classList.add("active");
  }
}

// Instantiate game controller when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.ludoGame = new LudoGameController();
});
