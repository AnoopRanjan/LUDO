/**
 * Emoji Movie Guessing Game - Core Game Engine
 * Manages game state, countdown timer, scoring, hints, explanations,
 * leaderboard, banner advertisements, and event listeners.
 */

// Featured movie sponsor promotions rotated on the game selection screen
const SPONSOR_ADS = [
  {
    brand: "CINEMA SPECIAL",
    icon: "🍿🥤",
    title: "CineSnacks VIP Popcorn Club",
    deal: "50% OFF",
    desc: "Grab half-off giant theater popcorn & ice-cold drinks on your next movie night! Use promo code:",
    code: "POPCORN50",
    cta: "Claim Offer",
    modalTitle: "Special Movie Night Offer",
    modalDeal: "50% OFF Popcorn & Drinks",
    modalDesc: "Show this voucher code at participating theater concession stands or online checkout to redeem your 50% discount!"
  },
  {
    brand: "STREAMING PASS",
    icon: "🎬✨",
    title: "StreamFlix Kids & Family",
    deal: "30 DAYS FREE",
    desc: "Stream 10,000+ animated classics & blockbuster films in stunning 4K HDR. Use promo code:",
    code: "STREAMFREE",
    cta: "Start Free Trial",
    modalTitle: "StreamFlix 30-Day Free Pass",
    modalDeal: "30 Days Unlimited Cinema",
    modalDesc: "Redeem this voucher at StreamFlix to activate your free 30-day family streaming subscription with zero ads!"
  },
  {
    brand: "ARCADE PERK",
    icon: "🎮⭐",
    title: "Movie Trivia Arena Deluxe",
    deal: "BONUS COINS",
    desc: "Love Emoji Flicks? Battle cinema buffs worldwide and unlock 5,000 free bonus tokens with code:",
    code: "TRIVIA5K",
    cta: "Unlock Bonus",
    modalTitle: "Trivia Arena Starter Pack",
    modalDeal: "5,000 Free Quiz Tokens",
    modalDesc: "Enter this promotional voucher in the Trivia Arena mobile app to claim your starter pack & special avatar badges!"
  }
];

class EmojiMovieGame {
  constructor() {
    // Game Configuration & State
    this.mode = "kids"; // 'kids' | 'adults' | 'all'
    this.difficulty = "easy"; // 'easy' | 'medium' | 'hard'
    this.roundLength = 20; // 10 | 20 | 50
    this.questions = [];
    this.currentIndex = 0;
    this.currentQuestion = null;

    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correctCount = 0;

    // Timer Properties
    this.timerInterval = null;
    this.maxTime = 25; // seconds based on difficulty
    this.timeLeft = 25;

    // Hint Properties
    this.hintsLeft = 2;
    this.fiftyFiftyLeft = 1;
    this.hintUsedThisRound = 0;
    this.isAnswered = false;

    // Banner Ad State
    this.currentAdIndex = 0;
    this.adInterval = null;

    // Confetti Engine
    this.confetti = new ConfettiEngine("confetti-canvas");

    // Pre-seeded high scores if none exist
    this.initLeaderboardStorage();

    // Cache DOM Elements
    this.cacheElements();

    // Bind Event Listeners
    this.bindEvents();

    // Sync sound & theme initial states
    this.syncInitialUI();

    // Initialize Banner Ad on Game Selection Screen
    this.initBannerAd();
  }

  // Cache all required DOM elements
  cacheElements() {
    this.body = document.body;

    // Screens & Modals
    this.screenWelcome = document.getElementById("screen-welcome");
    this.screenGameplay = document.getElementById("screen-gameplay");
    this.screenSummary = document.getElementById("screen-summary");
    this.modalExplanation = document.getElementById("modal-explanation");
    this.modalLeaderboard = document.getElementById("modal-leaderboard");
    this.modalHowToPlay = document.getElementById("modal-howtoplay");

    // Header Controls
    this.brandLogo = document.getElementById("brand-logo");
    this.headerModeBadge = document.getElementById("header-mode-badge");
    this.btnThemeToggle = document.getElementById("btn-theme-toggle");
    this.themeIcon = document.getElementById("theme-icon");
    this.btnSoundToggle = document.getElementById("btn-sound-toggle");
    this.soundIcon = document.getElementById("sound-icon");
    this.btnLeaderboardOpen = document.getElementById("btn-leaderboard-open");
    this.btnHowToPlay = document.getElementById("btn-how-to-play");

    // Setup Selectors
    this.modeCards = document.querySelectorAll(".mode-card");
    this.diffBtns = document.querySelectorAll(".diff-btn");
    this.lenBtns = document.querySelectorAll(".len-btn");
    this.btnStartGame = document.getElementById("btn-start-game");

    // HUD Elements
    this.hudQNumber = document.getElementById("hud-q-number");
    this.hudScore = document.getElementById("hud-score");
    this.hudStreak = document.getElementById("hud-streak");
    this.hudStreakBox = document.getElementById("hud-streak-box");
    this.scorePopup = document.getElementById("score-popup");
    this.timerCountdown = document.getElementById("timer-countdown");
    this.timerProgressRing = document.getElementById("timer-progress-ring");
    this.timerBox = document.getElementById("timer-box");
    this.gameProgressBar = document.getElementById("game-progress-bar");

    // Question Card Elements
    this.questionCard = document.getElementById("question-card");
    this.cardModeBadge = document.getElementById("card-mode-badge");
    this.cardDiffBadge = document.getElementById("card-diff-badge");
    this.cardGenreBadge = document.getElementById("card-genre-badge");
    this.emojiDisplay = document.getElementById("emoji-display");
    this.optionsGrid = document.getElementById("options-grid");
    this.btnUseHint = document.getElementById("btn-use-hint");
    this.hintsLeftCount = document.getElementById("hints-left-count");
    this.btnUse5050 = document.getElementById("btn-use-5050");
    this.fiftyLeftCount = document.getElementById("fifty-left-count");
    this.revealedHintBox = document.getElementById("revealed-hint-box");
    this.revealedHintText = document.getElementById("revealed-hint-text");
    this.btnQuitGame = document.getElementById("btn-quit-game");

    // Explanation Modal Elements
    this.explanationBanner = document.getElementById("explanation-banner");
    this.explanationIcon = document.getElementById("explanation-icon");
    this.explanationTitle = document.getElementById("explanation-title");
    this.explanationSubtitle = document.getElementById("explanation-subtitle");
    this.expMovieTitle = document.getElementById("exp-movie-title");
    this.expMovieMeta = document.getElementById("exp-movie-meta");
    this.expEmojiList = document.getElementById("exp-emoji-list");
    this.expTriviaText = document.getElementById("exp-trivia-text");
    this.btnNextQuestion = document.getElementById("btn-next-question");

    // Summary Elements
    this.summaryTrophy = document.getElementById("summary-trophy");
    this.summaryRankTitle = document.getElementById("summary-rank-title");
    this.summaryRankDesc = document.getElementById("summary-rank-desc");
    this.statFinalScore = document.getElementById("stat-final-score");
    this.statAccuracy = document.getElementById("stat-accuracy");
    this.statCorrectCount = document.getElementById("stat-correct-count");
    this.statBestStreak = document.getElementById("stat-best-streak");
    this.playerNameInput = document.getElementById("player-name-input");
    this.btnSaveScore = document.getElementById("btn-save-score");
    this.saveFeedback = document.getElementById("save-feedback");
    this.btnReplayGame = document.getElementById("btn-replay-game");
    this.btnViewLeaderboard = document.getElementById("btn-view-leaderboard");
    this.btnChangeMode = document.getElementById("btn-change-mode");

    // Leaderboard Modal Elements
    this.btnCloseLeaderboard = document.getElementById("btn-close-leaderboard");
    this.btnDismissLeaderboard = document.getElementById("btn-dismiss-leaderboard");
    this.btnClearScores = document.getElementById("btn-clear-scores");
    this.leaderboardTbody = document.getElementById("leaderboard-tbody");
    this.lbTabs = document.querySelectorAll(".lb-tab");

    // How to Play Modal Elements
    this.btnCloseHtp = document.getElementById("btn-close-htp");
    this.btnDismissHtp = document.getElementById("btn-dismiss-htp");

    // Banner Ad Elements (Screen 1)
    this.adBrandTag = document.getElementById("ad-brand-tag");
    this.adIcon = document.getElementById("ad-icon");
    this.adTitle = document.getElementById("ad-title");
    this.adDealBadge = document.getElementById("ad-deal-badge");
    this.adDesc = document.getElementById("ad-desc");
    this.adCodePreview = document.getElementById("ad-code-preview");
    this.adCtaLabel = document.getElementById("ad-cta-label");
    this.btnAdCta = document.getElementById("btn-ad-cta");
    this.btnNextAd = document.getElementById("btn-next-ad");
    this.btnAdInfo = document.getElementById("btn-ad-info");

    // Sponsor Modal Elements
    this.modalSponsor = document.getElementById("modal-sponsor");
    this.sponsorModalIcon = document.getElementById("sponsor-modal-icon");
    this.sponsorModalTitle = document.getElementById("sponsor-modal-title");
    this.sponsorModalDeal = document.getElementById("sponsor-modal-deal");
    this.sponsorModalDesc = document.getElementById("sponsor-modal-desc");
    this.sponsorPromoCode = document.getElementById("sponsor-promo-code");
    this.btnCopyCode = document.getElementById("btn-copy-code");
    this.copyFeedback = document.getElementById("copy-feedback");
    this.btnCloseSponsor = document.getElementById("btn-close-sponsor");
    this.btnDismissSponsor = document.getElementById("btn-dismiss-sponsor");
  }

  // Bind Event Listeners
  bindEvents() {
    // Mode Selectors
    this.modeCards.forEach(card => {
      card.addEventListener("click", () => {
        soundFX.playClick();
        this.modeCards.forEach(c => {
          c.classList.remove("active");
          c.setAttribute("aria-checked", "false");
        });
        card.classList.add("active");
        card.setAttribute("aria-checked", "true");
        this.setMode(card.dataset.mode);
      });
    });

    // Difficulty Selectors
    this.diffBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        soundFX.playClick();
        this.diffBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-checked", "true");
        this.difficulty = btn.dataset.difficulty;
      });
    });

    // Round Length Selectors
    this.lenBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        soundFX.playClick();
        this.lenBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-checked", "true");
        this.roundLength = parseInt(btn.dataset.length, 10);
      });
    });

    // Navigation & Header
    this.btnStartGame.addEventListener("click", () => this.startNewGame());
    this.brandLogo.addEventListener("click", () => this.goToWelcomeScreen());
    this.btnQuitGame.addEventListener("click", () => {
      if (confirm("Are you sure you want to exit the current round? Your progress will be saved to stats.")) {
        this.stopTimer();
        this.endGame();
      }
    });

    // Theme & Audio Controls
    this.btnThemeToggle.addEventListener("click", () => this.toggleTheme());
    this.btnSoundToggle.addEventListener("click", () => this.toggleSound());

    // Modals
    this.btnLeaderboardOpen.addEventListener("click", () => this.openLeaderboard());
    this.btnCloseLeaderboard.addEventListener("click", () => this.closeLeaderboard());
    this.btnDismissLeaderboard.addEventListener("click", () => this.closeLeaderboard());
    this.btnClearScores.addEventListener("click", () => this.clearLeaderboard());

    this.lbTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        soundFX.playClick();
        this.lbTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.renderLeaderboard(tab.dataset.filter);
      });
    });

    this.btnHowToPlay.addEventListener("click", () => this.openHowToPlay());
    this.btnCloseHtp.addEventListener("click", () => this.closeHowToPlay());
    this.btnDismissHtp.addEventListener("click", () => this.closeHowToPlay());

    // Gameplay Controls
    this.btnUseHint.addEventListener("click", () => this.useHint());
    this.btnUse5050.addEventListener("click", () => this.use5050());
    this.btnNextQuestion.addEventListener("click", () => this.advanceToNext());

    // Summary Actions
    this.btnSaveScore.addEventListener("click", () => this.saveScoreToLeaderboard());
    this.btnReplayGame.addEventListener("click", () => this.startNewGame());
    this.btnViewLeaderboard.addEventListener("click", () => this.openLeaderboard());
    this.btnChangeMode.addEventListener("click", () => this.goToWelcomeScreen());

    // Banner Ad & Sponsor Promotion Events
    if (this.btnNextAd) {
      this.btnNextAd.addEventListener("click", () => this.nextAd());
    }
    if (this.btnAdCta) {
      this.btnAdCta.addEventListener("click", () => this.openSponsorModal(false));
    }
    if (this.btnAdInfo) {
      this.btnAdInfo.addEventListener("click", () => this.openSponsorModal(true));
    }
    if (this.btnCloseSponsor) {
      this.btnCloseSponsor.addEventListener("click", () => this.closeSponsorModal());
    }
    if (this.btnDismissSponsor) {
      this.btnDismissSponsor.addEventListener("click", () => this.closeSponsorModal());
    }
    if (this.btnCopyCode) {
      this.btnCopyCode.addEventListener("click", () => this.copyPromoCode());
    }

    // Keyboard Shortcuts Support
    window.addEventListener("keydown", (e) => this.handleKeyboard(e));
  }

  // Handle Keyboard Inputs
  handleKeyboard(e) {
    // If typing in the player name input, do not trigger game hotkeys
    if (document.activeElement === this.playerNameInput) return;

    // Close modals on Escape
    if (e.key === "Escape") {
      this.closeLeaderboard();
      this.closeHowToPlay();
      this.closeSponsorModal();
      return;
    }

    // Space or Enter advances to next question when explanation modal is active
    if (this.modalExplanation.classList.contains("active")) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.advanceToNext();
        return;
      }
    }

    // Gameplay hotkeys (1-4 or A-D)
    if (this.screenGameplay.classList.contains("active") && !this.isAnswered) {
      const key = e.key.toUpperCase();
      let index = -1;
      if (key === "1" || key === "A") index = 0;
      if (key === "2" || key === "B") index = 1;
      if (key === "3" || key === "C") index = 2;
      if (key === "4" || key === "D") index = 3;

      if (index >= 0) {
        const optionButtons = this.optionsGrid.querySelectorAll(".option-btn");
        if (optionButtons[index] && !optionButtons[index].disabled && !optionButtons[index].classList.contains("eliminated-5050")) {
          optionButtons[index].click();
        }
      }

      // 'H' for Hint
      if (key === "H" && !this.btnUseHint.disabled) {
        this.useHint();
      }

      // 'F' for 50:50
      if (key === "F" && !this.btnUse5050.disabled) {
        this.use5050();
      }
    }
  }

  // Initialize UI (Sound icon, Theme, Mode)
  syncInitialUI() {
    this.soundIcon.textContent = soundFX.isMuted ? "🔇" : "🔊";

    const isDark = localStorage.getItem("emg_dark") === "true";
    if (isDark) {
      this.body.classList.add("dark-theme");
      this.themeIcon.textContent = "☀️";
    }

    this.setMode("kids");
  }

  // Mode Setter
  setMode(mode) {
    this.mode = mode;
    this.body.classList.remove("mode-kids", "mode-adults");

    if (mode === "kids") {
      this.body.classList.add("mode-kids");
      this.headerModeBadge.textContent = "Kids Edition 🌟";
    } else if (mode === "adults") {
      this.body.classList.add("mode-adults");
      this.headerModeBadge.textContent = "Adults Edition 🎬";
    } else {
      this.body.classList.add("mode-kids");
      this.headerModeBadge.textContent = "All Movies Mix 🍿";
    }
  }

  // Theme Toggle
  toggleTheme() {
    soundFX.playClick();
    const isDark = this.body.classList.toggle("dark-theme");
    localStorage.setItem("emg_dark", isDark ? "true" : "false");
    this.themeIcon.textContent = isDark ? "☀️" : "🌙";
  }

  // Sound Toggle
  toggleSound() {
    const isMuted = soundFX.toggleMute();
    this.soundIcon.textContent = isMuted ? "🔇" : "🔊";
    if (!isMuted) soundFX.playClick();
  }

  // Start New Game Session
  startNewGame() {
    soundFX.playClick();
    this.stopAdRotation();

    // Configure Difficulty Times & Initial Lifelines
    if (this.difficulty === "easy") {
      this.maxTime = 25;
      this.hintsLeft = 2;
      this.fiftyFiftyLeft = 1;
    } else if (this.difficulty === "medium") {
      this.maxTime = 18;
      this.hintsLeft = 1;
      this.fiftyFiftyLeft = 1;
    } else {
      this.maxTime = 12;
      this.hintsLeft = 1;
      this.fiftyFiftyLeft = 0; // Hard mode starts with 0 free 50:50
    }

    // Filter and shuffle questions
    let candidateQuestions = QuestionBank.getByMode(this.mode);
    if (candidateQuestions.length === 0) {
      candidateQuestions = QuestionBank.getAll();
    }
    const shuffled = QuestionBank.shuffle(candidateQuestions);
    this.questions = shuffled.slice(0, Math.min(this.roundLength, shuffled.length));

    // Reset scores & streaks
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correctCount = 0;
    this.currentIndex = 0;

    // Switch Screens
    this.showScreen("screen-gameplay");

    // Load first question
    this.loadQuestion(0);
  }

  // Load a Question by Index
  loadQuestion(index) {
    this.currentIndex = index;
    this.currentQuestion = this.questions[index];
    this.isAnswered = false;
    this.hintUsedThisRound = 0;

    // Update HUD
    this.hudQNumber.textContent = `${index + 1}/${this.questions.length}`;
    this.hudScore.textContent = this.score;
    this.updateStreakDisplay();
    this.updateProgressBar();

    // Update Badges
    this.cardModeBadge.textContent = this.currentQuestion.mode.toUpperCase();
    this.cardDiffBadge.textContent = this.currentQuestion.difficulty.toUpperCase();
    this.cardGenreBadge.textContent = this.currentQuestion.genre.split("/")[0].trim();

    // Render Emoji Display with staggered pop animations
    this.emojiDisplay.innerHTML = "";
    this.currentQuestion.emojis.forEach((emoji, idx) => {
      const pill = document.createElement("span");
      pill.className = "emoji-pill";
      pill.textContent = emoji;
      pill.style.animationDelay = `${idx * 0.1}s`;
      this.emojiDisplay.appendChild(pill);
    });

    // Reset Hint Drawers & Buttons
    this.revealedHintBox.classList.add("hidden");
    this.revealedHintText.textContent = "";
    this.hintsLeftCount.textContent = this.hintsLeft;
    this.fiftyLeftCount.textContent = this.fiftyFiftyLeft;

    this.btnUseHint.disabled = this.hintsLeft <= 0;
    this.btnUse5050.disabled = this.fiftyFiftyLeft <= 0;

    // Render 4 Multiple Choice Options (randomized order)
    this.optionsGrid.innerHTML = "";
    const randomizedOptions = QuestionBank.shuffle(this.currentQuestion.options);
    const letters = ["A", "B", "C", "D"];

    randomizedOptions.forEach((optionTitle, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.dataset.title = optionTitle;

      const letterSpan = document.createElement("span");
      letterSpan.className = "option-letter";
      letterSpan.textContent = letters[idx];

      const textSpan = document.createElement("span");
      textSpan.className = "option-title-text";
      textSpan.textContent = optionTitle;

      btn.appendChild(letterSpan);
      btn.appendChild(textSpan);

      btn.addEventListener("click", () => this.handleOptionSelection(btn, optionTitle));
      this.optionsGrid.appendChild(btn);
    });

    // Start Countdown Timer
    this.startTimer();
  }

  // Handle Option Selection
  handleOptionSelection(selectedBtn, chosenTitle) {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.stopTimer();

    const isCorrect = chosenTitle === this.currentQuestion.title;
    const allOptionButtons = this.optionsGrid.querySelectorAll(".option-btn");

    // Disable all options
    allOptionButtons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.title === this.currentQuestion.title) {
        btn.classList.add("revealed-target");
      }
    });

    if (isCorrect) {
      selectedBtn.classList.add("selected-correct");
      soundFX.playCorrect();

      // Confetti burst from button position
      const rect = selectedBtn.getBoundingClientRect();
      this.confetti.burst(50, rect.left + rect.width / 2, rect.top + rect.height / 2);

      // Score Calculation
      this.handleCorrectAnswer();
    } else {
      selectedBtn.classList.add("selected-wrong");
      soundFX.playWrong();
      this.handleWrongAnswer(false);
    }

    // Show Explanation Modal after short moment
    setTimeout(() => {
      this.showExplanationModal(isCorrect, false);
    }, 900);
  }

  // Timer Management
  startTimer() {
    this.stopTimer();
    this.timeLeft = this.maxTime;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        soundFX.playUrgentTick();
      } else if (this.timeLeft > 0) {
        soundFX.playTick();
      }

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    this.timerCountdown.textContent = Math.max(0, this.timeLeft);

    // Circular SVG dash calculation (Circumference ~ 113.1)
    const circumference = 2 * Math.PI * 18;
    const progress = Math.max(0, this.timeLeft) / this.maxTime;
    const offset = circumference * (1 - progress);
    this.timerProgressRing.style.strokeDashoffset = offset;

    // Shift Color based on urgency
    if (this.timeLeft <= 5) {
      document.documentElement.style.setProperty("--timer-color", "#EF4444");
      this.timerBox.classList.add("timer-urgent");
    } else if (this.timeLeft <= 10) {
      document.documentElement.style.setProperty("--timer-color", "#F59E0B");
      this.timerBox.classList.remove("timer-urgent");
    } else {
      document.documentElement.style.setProperty("--timer-color", "#10B981");
      this.timerBox.classList.remove("timer-urgent");
    }
  }

  // Handle Timeout
  handleTimeout() {
    if (this.isAnswered) return;
    this.isAnswered = true;
    soundFX.playWrong();

    // Highlight correct answer in green
    const allOptionButtons = this.optionsGrid.querySelectorAll(".option-btn");
    allOptionButtons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.title === this.currentQuestion.title) {
        btn.classList.add("revealed-target");
      }
    });

    this.handleWrongAnswer(true);

    setTimeout(() => {
      this.showExplanationModal(false, true);
    }, 900);
  }

  // Scoring Logic for Correct Answer
  handleCorrectAnswer() {
    this.correctCount++;
    this.streak++;
    if (this.streak > this.bestStreak) {
      this.bestStreak = this.streak;
    }

    // Base Points
    let earned = 100;
    if (this.difficulty === "medium") earned = 150;
    if (this.difficulty === "hard") earned = 200;

    // Speed Bonus (answered with time remaining)
    const timeFraction = this.timeLeft / this.maxTime;
    let speedBonus = 0;
    if (timeFraction >= 0.7) {
      speedBonus = 50;
    } else if (timeFraction >= 0.4) {
      speedBonus = 25;
    }

    // Streak Multiplier
    let multiplier = 1.0;
    if (this.streak >= 5) multiplier = 2.0;
    else if (this.streak >= 4) multiplier = 1.75;
    else if (this.streak >= 3) multiplier = 1.5;
    else if (this.streak >= 2) multiplier = 1.25;

    const totalRoundPoints = Math.round((earned + speedBonus) * multiplier);
    this.score += totalRoundPoints;
    this.hudScore.textContent = this.score;

    // Show floating score popup animation
    this.showScorePopup(`+${totalRoundPoints}`);

    // Streak Audio Milestone (when hitting 3x or 5x)
    if (this.streak === 3 || this.streak === 5) {
      soundFX.playStreak();
    }

    this.updateStreakDisplay();
  }

  // Wrong Answer Handler
  handleWrongAnswer(isTimeout = false) {
    this.streak = 0;
    this.updateStreakDisplay();
    this.showScorePopup(isTimeout ? "Time's up!" : "+0", isTimeout || true);
  }

  // Floating Score Popup
  showScorePopup(text, isNegative = false) {
    this.scorePopup.textContent = text;
    this.scorePopup.style.color = isNegative ? "var(--accent-red)" : "var(--accent-green)";
    this.scorePopup.classList.remove("animate-up");
    void this.scorePopup.offsetWidth; // Reflow
    this.scorePopup.classList.add("animate-up");
  }

  // Streak Badge Display
  updateStreakDisplay() {
    this.hudStreak.textContent = `${this.streak}x`;
    if (this.streak >= 2) {
      this.hudStreakBox.classList.add("streak-active");
    } else {
      this.hudStreakBox.classList.remove("streak-active");
    }
  }

  // Overall Progress Bar
  updateProgressBar() {
    const percent = ((this.currentIndex + 1) / this.questions.length) * 100;
    this.gameProgressBar.style.width = `${percent}%`;
  }

  // Lifeline 1: Text Clue
  useHint() {
    if (this.hintsLeft <= 0 || this.isAnswered) return;
    this.hintsLeft--;
    this.hintsLeftCount.textContent = this.hintsLeft;
    soundFX.playHint();

    const hintClue = this.currentQuestion.hints[0] || `Released in ${this.currentQuestion.year} (${this.currentQuestion.genre})`;
    this.revealedHintText.textContent = `${hintClue} (Release: ${this.currentQuestion.year})`;
    this.revealedHintBox.classList.remove("hidden");

    if (this.hintsLeft <= 0) {
      this.btnUseHint.disabled = true;
    }
  }

  // Lifeline 2: 50:50 (Eliminate 2 wrong choices)
  use5050() {
    if (this.fiftyFiftyLeft <= 0 || this.isAnswered) return;
    this.fiftyFiftyLeft--;
    this.fiftyLeftCount.textContent = this.fiftyFiftyLeft;
    soundFX.play5050();

    const allButtons = Array.from(this.optionsGrid.querySelectorAll(".option-btn"));
    const wrongButtons = allButtons.filter(b => b.dataset.title !== this.currentQuestion.title);
    const shuffledWrong = QuestionBank.shuffle(wrongButtons);

    // Eliminate first two wrong options
    shuffledWrong.slice(0, 2).forEach(btn => {
      btn.classList.add("eliminated-5050");
      btn.disabled = true;
    });

    this.btnUse5050.disabled = true;
  }

  // Show Post-Question Explanation Modal
  showExplanationModal(isCorrect, isTimeout) {
    const q = this.currentQuestion;

    // Status Banner
    this.explanationBanner.className = "explanation-status-banner";
    if (isCorrect) {
      this.explanationBanner.classList.add("correct");
      this.explanationIcon.textContent = "🎉";
      this.explanationTitle.textContent = "Spot On! Correct!";
      this.explanationSubtitle.textContent = `Combo Streak: ${this.streak}x 🔥`;
    } else if (isTimeout) {
      this.explanationBanner.classList.add("wrong");
      this.explanationIcon.textContent = "⏰";
      this.explanationTitle.textContent = "Time's Up!";
      this.explanationSubtitle.textContent = `The answer was "${q.title}"`;
    } else {
      this.explanationBanner.classList.add("wrong");
      this.explanationIcon.textContent = "❌";
      this.explanationTitle.textContent = "Oops! Not quite!";
      this.explanationSubtitle.textContent = `The answer was "${q.title}"`;
    }

    // Movie Details
    this.expMovieTitle.textContent = q.title;
    this.expMovieMeta.textContent = `Released ${q.year} • ${q.genre}`;

    // Emoji Breakdown List
    this.expEmojiList.innerHTML = "";
    q.explanation.emojis.forEach(item => {
      const row = document.createElement("div");
      row.className = "meaning-row";

      const emojiBox = document.createElement("div");
      emojiBox.className = "meaning-emoji";
      emojiBox.textContent = item.emoji;

      const meaningText = document.createElement("div");
      meaningText.className = "meaning-text";
      meaningText.textContent = item.meaning;

      row.appendChild(emojiBox);
      row.appendChild(meaningText);
      this.expEmojiList.appendChild(row);
    });

    // Trivia Fact
    this.expTriviaText.textContent = q.explanation.trivia;

    // Next Button text
    const isLastQuestion = this.currentIndex >= this.questions.length - 1;
    this.btnNextQuestion.querySelector("span:first-child").textContent = isLastQuestion ? "View Final Results 🏆" : "Next Movie ➔";

    // Show Modal
    this.modalExplanation.classList.add("active");
  }

  // Advance to Next Question or End Game
  advanceToNext() {
    soundFX.playClick();
    this.modalExplanation.classList.remove("active");

    if (this.currentIndex >= this.questions.length - 1) {
      this.endGame();
    } else {
      this.loadQuestion(this.currentIndex + 1);
    }
  }

  // End of Round & Summary Presentation
  endGame() {
    this.stopTimer();
    this.showScreen("screen-summary");

    const totalQuestions = this.questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((this.correctCount / totalQuestions) * 100) : 0;

    this.statFinalScore.textContent = this.score;
    this.statAccuracy.textContent = `${accuracy}%`;
    this.statCorrectCount.textContent = `${this.correctCount}/${totalQuestions}`;
    this.statBestStreak.textContent = `${this.bestStreak}🔥`;

    // Dynamic Title & Rank Assignment
    let rankTitle = "Cinema Novice";
    let rankDesc = "Keep watching movies and playing to sharpen your emoji decoding skills!";
    let trophy = "🍿";

    if (accuracy >= 90) {
      rankTitle = "Cinematic Legend! 🏆";
      rankDesc = "Incredible masterclass! You decoded the emojis with supreme movie knowledge!";
      trophy = "👑";
    } else if (accuracy >= 75) {
      rankTitle = "Ultimate Movie Buff! 🌟";
      rankDesc = "Outstanding performance! You know your films front to back!";
      trophy = "🏆";
    } else if (accuracy >= 55) {
      rankTitle = "Silver Screen Aficionado! 🎬";
      rankDesc = "Solid movie intuition! A few tricky emojis slipped by, but great job!";
      trophy = "⭐";
    } else {
      rankTitle = "Popcorn Eater 🍿";
      rankDesc = "Good effort! Try Kids Mode or give it another spin to beat your high score!";
      trophy = "🎟️";
    }

    this.summaryRankTitle.textContent = rankTitle;
    this.summaryRankDesc.textContent = rankDesc;
    this.summaryTrophy.textContent = trophy;

    // Confetti celebration if performed well
    if (accuracy >= 60) {
      soundFX.playVictory();
      this.confetti.celebrate(3500);
    } else {
      soundFX.playClick();
    }

    // Reset save feedback state
    this.saveFeedback.textContent = "";
    this.btnSaveScore.disabled = false;
  }

  // Pre-seed Leaderboard in LocalStorage
  initLeaderboardStorage() {
    const existing = localStorage.getItem("emg_leaderboard");
    if (!existing) {
      const defaultScores = [
        { name: "SimbaFan99", mode: "kids", difficulty: "easy", score: 2850, accuracy: "95%", date: "2026-10-25" },
        { name: "PixelWizard", mode: "kids", difficulty: "medium", score: 2400, accuracy: "90%", date: "2026-10-28" },
        { name: "NeoMatrix", mode: "adults", difficulty: "hard", score: 3200, accuracy: "100%", date: "2026-10-29" },
        { name: "CinephileMax", mode: "adults", difficulty: "medium", score: 2750, accuracy: "85%", date: "2026-10-30" },
        { name: "PopcornCaptain", mode: "kids", difficulty: "easy", score: 2100, accuracy: "80%", date: "2026-10-31" }
      ];
      localStorage.setItem("emg_leaderboard", JSON.stringify(defaultScores));
    }
  }

  // Save Score to LocalStorage Leaderboard
  saveScoreToLeaderboard() {
    const name = this.playerNameInput.value.trim() || "Anonymous Hero";
    const totalQuestions = this.questions.length;
    const accuracy = totalQuestions > 0 ? `${Math.round((this.correctCount / totalQuestions) * 100)}%` : "0%";

    const newEntry = {
      name: name,
      mode: this.mode,
      difficulty: this.difficulty,
      score: this.score,
      accuracy: accuracy,
      date: new Date().toISOString().split("T")[0]
    };

    let scores = [];
    try {
      scores = JSON.parse(localStorage.getItem("emg_leaderboard")) || [];
    } catch (e) {
      scores = [];
    }

    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 30); // Store top 30
    localStorage.setItem("emg_leaderboard", JSON.stringify(scores));

    soundFX.playCorrect();
    this.saveFeedback.textContent = "✅ Saved to Leaderboard!";
    this.btnSaveScore.disabled = true;
  }

  // Open & Render Leaderboard
  openLeaderboard() {
    soundFX.playClick();
    this.renderLeaderboard("all");
    this.modalLeaderboard.classList.add("active");
  }

  closeLeaderboard() {
    soundFX.playClick();
    this.modalLeaderboard.classList.remove("active");
  }

  clearLeaderboard() {
    if (confirm("Reset the leaderboard back to default high scores?")) {
      localStorage.removeItem("emg_leaderboard");
      this.initLeaderboardStorage();
      this.renderLeaderboard("all");
      soundFX.playClick();
    }
  }

  renderLeaderboard(filterMode = "all") {
    let scores = [];
    try {
      scores = JSON.parse(localStorage.getItem("emg_leaderboard")) || [];
    } catch (e) {
      scores = [];
    }

    if (filterMode !== "all") {
      scores = scores.filter(s => s.mode === filterMode);
    }

    this.leaderboardTbody.innerHTML = "";

    if (scores.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No scores recorded yet in this category!</td>`;
      this.leaderboardTbody.appendChild(row);
      return;
    }

    scores.forEach((entry, idx) => {
      const tr = document.createElement("tr");

      let rankDisplay = `${idx + 1}`;
      let rankClass = "";
      if (idx === 0) { rankDisplay = "🥇 1st"; rankClass = "lb-rank-1"; }
      else if (idx === 1) { rankDisplay = "🥈 2nd"; rankClass = "lb-rank-2"; }
      else if (idx === 2) { rankDisplay = "🥉 3rd"; rankClass = "lb-rank-3"; }

      tr.innerHTML = `
        <td class="${rankClass}">${rankDisplay}</td>
        <td><strong>${this.escapeHTML(entry.name)}</strong></td>
        <td><span class="badge-mode" style="padding: 2px 6px; font-size: 0.68rem;">${entry.mode.toUpperCase()}</span></td>
        <td><span class="badge-diff" style="padding: 2px 6px; font-size: 0.68rem;">${entry.difficulty.toUpperCase()}</span></td>
        <td><strong style="color: var(--primary);">${entry.score.toLocaleString()}</strong></td>
        <td>${entry.accuracy}</td>
      `;
      this.leaderboardTbody.appendChild(tr);
    });
  }

  // How to Play Modal
  openHowToPlay() {
    soundFX.playClick();
    this.modalHowToPlay.classList.add("active");
  }

  closeHowToPlay() {
    soundFX.playClick();
    this.modalHowToPlay.classList.remove("active");
  }

  // Screen Switcher
  showScreen(screenId) {
    [this.screenWelcome, this.screenGameplay, this.screenSummary].forEach(s => {
      s.classList.remove("active");
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  goToWelcomeScreen() {
    soundFX.playClick();
    this.stopTimer();
    this.modalExplanation.classList.remove("active");
    this.modalLeaderboard.classList.remove("active");
    this.modalHowToPlay.classList.remove("active");
    if (this.modalSponsor) this.modalSponsor.classList.remove("active");
    this.showScreen("screen-welcome");
    this.startAdRotation();
  }

  // ==========================================
  // BANNER AD & SPONSOR SYSTEM
  // ==========================================
  initBannerAd() {
    this.renderAd(0);
    this.startAdRotation();
  }

  startAdRotation() {
    this.stopAdRotation();
    this.adInterval = setInterval(() => {
      this.nextAd(true);
    }, 8500);
  }

  stopAdRotation() {
    if (this.adInterval) {
      clearInterval(this.adInterval);
      this.adInterval = null;
    }
  }

  renderAd(index) {
    this.currentAdIndex = (index + SPONSOR_ADS.length) % SPONSOR_ADS.length;
    const ad = SPONSOR_ADS[this.currentAdIndex];

    if (!this.adTitle) return;

    this.adBrandTag.textContent = ad.brand;
    this.adIcon.textContent = ad.icon;
    this.adTitle.textContent = ad.title;
    this.adDealBadge.textContent = ad.deal;
    this.adDesc.innerHTML = `${ad.desc} <code class="ad-code">${ad.code}</code>`;
    this.adCtaLabel.textContent = ad.cta;

    // Keep modal content in sync with currently active ad
    if (this.sponsorModalIcon) this.sponsorModalIcon.textContent = ad.icon;
    if (this.sponsorModalTitle) this.sponsorModalTitle.textContent = ad.modalTitle;
    if (this.sponsorModalDeal) this.sponsorModalDeal.textContent = ad.modalDeal;
    if (this.sponsorModalDesc) this.sponsorModalDesc.textContent = ad.modalDesc;
    if (this.sponsorPromoCode) this.sponsorPromoCode.textContent = ad.code;
    if (this.copyFeedback) this.copyFeedback.textContent = "";
  }

  nextAd(isAuto = false) {
    if (!isAuto) soundFX.playClick();
    this.renderAd(this.currentAdIndex + 1);
  }

  openSponsorModal(isInfoOnly = false) {
    soundFX.playClick();
    const ad = SPONSOR_ADS[this.currentAdIndex];

    if (isInfoOnly) {
      this.sponsorModalTitle.textContent = "About Sponsor Advertisements";
      this.sponsorModalDeal.textContent = "100% Free Game";
      this.sponsorModalDesc.textContent = `This sponsored promotion by "${ad.title}" helps fund Emoji Flicks, keeping all 100 questions, modes, hints, and sound effects completely free for everyone with no paywalls!`;
    } else {
      this.sponsorModalTitle.textContent = ad.modalTitle;
      this.sponsorModalDeal.textContent = ad.modalDeal;
      this.sponsorModalDesc.textContent = ad.modalDesc;
    }

    if (this.copyFeedback) this.copyFeedback.textContent = "";
    if (this.modalSponsor) this.modalSponsor.classList.add("active");
  }

  closeSponsorModal() {
    soundFX.playClick();
    if (this.modalSponsor) this.modalSponsor.classList.remove("active");
  }

  copyPromoCode() {
    soundFX.playCorrect();
    const code = this.sponsorPromoCode ? this.sponsorPromoCode.textContent.trim() : "POPCORN50";

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        if (this.copyFeedback) this.copyFeedback.textContent = `✅ Code "${code}" copied to clipboard!`;
      }).catch(() => {
        this.fallbackCopy(code);
      });
    } else {
      this.fallbackCopy(code);
    }
  }

  fallbackCopy(code) {
    const tempInput = document.createElement("input");
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand("copy");
      if (this.copyFeedback) this.copyFeedback.textContent = `✅ Code "${code}" copied to clipboard!`;
    } catch (e) {
      if (this.copyFeedback) this.copyFeedback.textContent = `Voucher code: ${code}`;
    }
    document.body.removeChild(tempInput);
  }

  // Sanitizer
  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

// Instantiate and initialize game once DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  window.gameInstance = new EmojiMovieGame();
});
