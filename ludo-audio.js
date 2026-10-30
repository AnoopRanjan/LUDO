/**
 * Ludo Master - Synthesized Web Audio API Sound Engine
 * Zero external audio files required - works offline and across all browsers.
 */

class LudoAudio {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem("ludo_muted") === "true";
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("ludo_muted", this.isMuted ? "true" : "false");
    return this.isMuted;
  }

  setMute(state) {
    this.isMuted = !!state;
    localStorage.setItem("ludo_muted", this.isMuted ? "true" : "false");
  }

  // Base tone generator
  playTone(frequency, type = "sine", duration = 0.15, startTime = 0, gainVal = 0.15) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime + startTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio tone error:", e);
    }
  }

  // UI Button Click
  playClick() {
    if (this.isMuted) return;
    this.playTone(700, "sine", 0.05, 0, 0.1);
  }

  // Realistic physical dice rattle
  playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const clickCount = 8;
      for (let i = 0; i < clickCount; i++) {
        const delay = i * 0.045 + Math.random() * 0.02;
        const freq = 200 + Math.random() * 400;
        const dur = 0.035;
        this.playTone(freq, "triangle", dur, delay, 0.12);
      }
    } catch (e) {
      console.warn("Dice roll audio error:", e);
    }
  }

  // Result chime when dice stops (special fanfare for 6)
  playDiceResult(num) {
    if (this.isMuted) return;
    if (num === 6) {
      // Lucky 6 fanfare!
      this.playTone(523.25, "triangle", 0.15, 0, 0.2); // C5
      this.playTone(659.25, "triangle", 0.15, 0.08, 0.2); // E5
      this.playTone(783.99, "triangle", 0.25, 0.16, 0.25); // G5
      this.playTone(1046.50, "sine", 0.35, 0.24, 0.3); // C6
    } else {
      const baseFreq = 300 + num * 60;
      this.playTone(baseFreq, "sine", 0.12, 0, 0.15);
      this.playTone(baseFreq * 1.5, "sine", 0.1, 0.05, 0.08);
    }
  }

  // Token hop step sound
  playTokenHop() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      console.warn("Token hop audio error:", e);
    }
  }

  // Token leaves home base / yard
  playTokenExit() {
    if (this.isMuted) return;
    this.playTone(440, "triangle", 0.12, 0, 0.2);
    this.playTone(880, "sine", 0.22, 0.08, 0.25);
  }

  // Capturing an opponent's token: dramatic boom/crunch!
  playCapture() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      
      // Impact bass drop
      const bass = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bass.type = "sawtooth";
      bass.frequency.setValueAtTime(260, now);
      bass.frequency.exponentialRampToValueAtTime(45, now + 0.28);
      bassGain.gain.setValueAtTime(0.35, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      bass.connect(bassGain);
      bassGain.connect(this.audioCtx.destination);
      bass.start(now);
      bass.stop(now + 0.3);

      // Zap tone
      this.playTone(600, "square", 0.1, 0.05, 0.15);
      this.playTone(350, "triangle", 0.2, 0.15, 0.2);
    } catch (e) {
      console.warn("Capture audio error:", e);
    }
  }

  // Landing on a Safe Star square
  playSafe() {
    if (this.isMuted) return;
    this.playTone(659.25, "sine", 0.2, 0, 0.15); // E5
    this.playTone(987.77, "triangle", 0.25, 0.08, 0.2); // B5
    this.playTone(1318.51, "sine", 0.35, 0.16, 0.15); // E6
  }

  // Reaching Home Goal!
  playHome() {
    if (this.isMuted) return;
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      this.playTone(freq, "triangle", 0.28, idx * 0.07, 0.22);
      this.playTone(freq * 1.5, "sine", 0.2, idx * 0.07, 0.08);
    });
  }

  // Turn pass when no moves are possible
  playNoMove() {
    if (this.isMuted) return;
    this.playTone(280, "sine", 0.15, 0, 0.12);
    this.playTone(220, "sine", 0.22, 0.1, 0.12);
  }

  // Grand Victory Fanfare!
  playVictory() {
    if (this.isMuted) return;
    const fanfare = [
      { f: 523.25, d: 0.18, t: 0 },
      { f: 659.25, d: 0.18, t: 0.15 },
      { f: 783.99, d: 0.18, t: 0.30 },
      { f: 1046.50, d: 0.45, t: 0.45 },
      { f: 880.00, d: 0.20, t: 0.85 },
      { f: 1046.50, d: 0.65, t: 1.05 }
    ];
    fanfare.forEach(item => {
      this.playTone(item.f, "triangle", item.d, item.t, 0.25);
      this.playTone(item.f * 1.5, "sine", item.d * 0.8, item.t, 0.08);
    });
  }
}

// Global audio singleton
window.ludoAudio = new LudoAudio();
