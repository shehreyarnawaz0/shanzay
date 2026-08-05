/* ==========================================================================
   EXACT-PITCH HAPPY BIRTHDAY AUDIO SYNTHESIZER
   ========================================================================== */

class BirthdayAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.soundEnabled = true;
    this.melodyTimeouts = [];
    this.audioElement = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startMelody() {
    this.soundEnabled = true;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (!this.isPlaying) {
          this.playBirthdayMelody();
        }
      });
    } else {
      if (!this.isPlaying) {
        this.playBirthdayMelody();
      }
    }
  }

  toggleSound() {
    if (this.soundEnabled && this.isPlaying) {
      this.soundEnabled = false;
      this.stopMelody();
      return false;
    } else {
      this.startMelody();
      return true;
    }
  }

  // Exact standard note frequencies (C Major Scale)
  getNoteFreq(note) {
    const freqs = {
      'G4': 392.00,
      'A4': 440.00,
      'B4': 493.88,
      'C5': 523.25,
      'D5': 587.33,
      'E5': 659.25,
      'F5': 698.46,
      'G5': 783.99
    };
    return freqs[note] || 440.0;
  }

  // Warm Music Box Chime Note
  playNote(noteName, durationSec = 0.5, volume = 0.35) {
    if (!this.soundEnabled || !noteName) return;
    this.init();

    const freq = this.getNoteFreq(noteName);
    const t = this.ctx.currentTime;

    // Core Sine Oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Warm envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);

    // Sub Overtone (adds richness)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(volume * 0.2, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + (durationSec * 0.6));

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.ctx.destination);
    gain2.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + durationSec);
    osc2.stop(t + durationSec);
  }

  playBirthdayMelody() {
    if (!this.soundEnabled) return;
    this.init();
    this.stopMelody();
    this.isPlaying = true;

    // Standard Happy Birthday Sheet Music in C Major:
    // [Note, BeatLength] (1 beat = 450ms)
    const beatMs = 450;
    const song = [
      // Line 1: Happy Birthday to you
      ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['C5', 1.0], ['B4', 2.0],

      // Line 2: Happy Birthday to you
      ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['D5', 1.0], ['C5', 2.0],

      // Line 3: Happy Birthday dear Murshand
      ['G4', 0.75], ['G4', 0.25], ['G5', 1.0], ['E5', 1.0], ['C5', 1.0], ['B4', 1.0], ['A4', 2.0],

      // Line 4: Happy Birthday to you!
      ['F5', 0.75], ['F5', 0.25], ['E5', 1.0], ['C5', 1.0], ['D5', 1.0], ['C5', 2.5]
    ];

    let currentDelay = 0;

    const playSequence = () => {
      if (!this.isPlaying || !this.soundEnabled) return;

      currentDelay = 0;
      this.melodyTimeouts = [];

      song.forEach(([note, beats], index) => {
        const durationSec = (beats * beatMs) / 1000 + 0.5;
        const noteDelay = currentDelay;

        const timeout = setTimeout(() => {
          if (this.isPlaying && this.soundEnabled) {
            this.playNote(note, durationSec, 0.4);
          }
        }, noteDelay);

        this.melodyTimeouts.push(timeout);
        currentDelay += beats * beatMs;
      });

      // Loop after song ends + short pause
      const totalSongTime = currentDelay + 1200;
      const loopTimeout = setTimeout(() => {
        if (this.isPlaying && this.soundEnabled) {
          playSequence();
        }
      }, totalSongTime);

      this.melodyTimeouts.push(loopTimeout);
    };

    playSequence();
  }

  stopMelody() {
    this.isPlaying = false;
    this.melodyTimeouts.forEach(t => clearTimeout(t));
    this.melodyTimeouts = [];
  }

  playBlowSound() {
    if (!this.soundEnabled) return;
    this.init();

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 1.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  playPopFanfare() {
    if (!this.soundEnabled) return;
    this.init();

    const fanfareNotes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'];
    fanfareNotes.forEach((note, i) => {
      setTimeout(() => {
        this.playNote(note, 0.6, 0.4);
      }, i * 80);
    });
  }
}

export const audioSynth = new BirthdayAudioSynth();
