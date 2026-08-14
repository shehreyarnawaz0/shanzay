/* ==========================================================================
   MAIN APPLICATION CONTROLLER - BIRTHDAY WEBSITE FOR SHANZAY AHMED
   ========================================================================== */

import confetti from 'canvas-confetti';
import { BirthdayThreeScene } from './threeScene.js';
import { audioSynth } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Scene
  const threeScene = new BirthdayThreeScene('canvas-container');

  // 2. Start continuous background music on first interaction
  const startAudioOnFirstInteraction = () => {
    audioSynth.startMelody();
    ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
      window.removeEventListener(evt, startAudioOnFirstInteraction);
    });
  };
  audioSynth.startMelody();
  ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, startAudioOnFirstInteraction, { once: true });
  });

  // 3. Countdown Timer targeting August 16th
  const updateCountdown = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(currentYear, 7, 16, 0, 0, 0);
    if (now.getTime() > targetDate.getTime()) {
      if (now.getMonth() === 7 && now.getDate() === 16) {
        document.getElementById('countdown-label').textContent = "🎉 TODAY IS SHANZAY'S BIRTHDAY! 🎉";
      } else {
        targetDate = new Date(currentYear + 1, 7, 16, 0, 0, 0);
      }
    }
    const diff = targetDate.getTime() - now.getTime();
    if (diff > 0) {
      document.getElementById('days').textContent = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      document.getElementById('hours').textContent = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      document.getElementById('minutes').textContent = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      document.getElementById('seconds').textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
    } else {
      ['days','hours','minutes','seconds'].forEach(id => document.getElementById(id).textContent = '00');
    }
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ===== FEATURE 1: AUTO-FIREWORKS ON BIRTHDAY (August 16) =====
  const now = new Date();
  const isBirthday = now.getMonth() === 7 && now.getDate() === 16;
  const birthdayPopup = document.getElementById('birthday-popup');
  const birthdayPopupClose = document.getElementById('birthday-popup-close');

  if (isBirthday) {
    // Show birthday popup after 2 seconds with epic fireworks
    setTimeout(() => {
      birthdayPopup.classList.remove('hidden');
      launchBirthdayBurst();
    }, 2000);
  }

  birthdayPopupClose?.addEventListener('click', () => {
    birthdayPopup.classList.add('hidden');
    launchFireworks();
  });

  // ===== FEATURE 2: ANIMATED TYPEWRITER GREETING =====
  const typewriterEl = document.getElementById('typewriter-text');
  const typewriterMessages = [
    "Happy Birthday, Shanzay Ahmed...",
    "The one we proudly call Murshad... 👑",
    "August 16 is your day to shine! 🌟",
    "May this year be your most incredible yet! ✨"
  ];
  let twMsgIndex = 0;
  let twCharIndex = 0;
  let twDeleting = false;

  function runTypewriter() {
    if (!typewriterEl) return;
    const currentMsg = typewriterMessages[twMsgIndex];

    if (!twDeleting) {
      typewriterEl.textContent = currentMsg.substring(0, twCharIndex + 1);
      twCharIndex++;
      if (twCharIndex === currentMsg.length) {
        twDeleting = true;
        setTimeout(runTypewriter, 2200);
        return;
      }
    } else {
      typewriterEl.textContent = currentMsg.substring(0, twCharIndex - 1);
      twCharIndex--;
      if (twCharIndex === 0) {
        twDeleting = false;
        twMsgIndex = (twMsgIndex + 1) % typewriterMessages.length;
      }
    }
    setTimeout(runTypewriter, twDeleting ? 38 : 62);
  }
  runTypewriter();

  // ===== FEATURE 5: CAKE-CUT OVERLAY (after blowing candles) =====
  const cakeCutOverlay = document.getElementById('cake-cut-overlay');
  const cakeCutClose = document.getElementById('cake-cut-close');

  threeScene.onCandlesBlown = () => {
    cakeCutOverlay.classList.remove('hidden');
    launchConfetti();
  };

  cakeCutClose?.addEventListener('click', () => {
    cakeCutOverlay.classList.add('hidden');
  });
  cakeCutOverlay?.addEventListener('click', (e) => {
    if (e.target === cakeCutOverlay) cakeCutOverlay.classList.add('hidden');
  });

  // 4. Confetti / Fireworks helpers
  const launchConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff2a8d', '#00f0ff', '#9d4edd', '#ffffff']
    });
  };

  const launchFireworks = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    audioSynth.playPopFanfare();
    (function frame() {
      confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ffd700', '#ff2a8d', '#00f0ff'] });
      confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#9d4edd', '#ffd700', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  function launchBirthdayBurst() {
    const duration = 6 * 1000;
    const end = Date.now() + duration;
    audioSynth.playPopFanfare();
    (function frame() {
      confetti({ particleCount: 12, angle: 60, spread: 80, origin: { x: 0 }, colors: ['#ffd700', '#ff2a8d', '#00f0ff', '#ffffff'] });
      confetti({ particleCount: 12, angle: 120, spread: 80, origin: { x: 1 }, colors: ['#9d4edd', '#ffd700', '#ff2a8d'] });
      confetti({ particleCount: 8, spread: 100, origin: { x: 0.5, y: 0 }, colors: ['#ffd700', '#ffffff', '#00f0ff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  // 5. Stage Control Buttons
  const blowCandlesBtn = document.getElementById('blow-candles-btn');
  const openGiftBtn = document.getElementById('open-gift-btn');
  const fireworksBtn = document.getElementById('fireworks-btn');
  const giftModal = document.getElementById('gift-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalCelebrateBtn = document.getElementById('modal-celebrate-btn');

  blowCandlesBtn.addEventListener('click', () => {
    threeScene.blowOutCandles();
    audioSynth.playBlowSound();
    setTimeout(() => launchConfetti(), 400);
  });

  threeScene.onCakeClick = () => {
    threeScene.blowOutCandles();
    audioSynth.playBlowSound();
    launchConfetti();
  };

  const openGiftModalHandler = () => {
    threeScene.openGiftBox();
    audioSynth.playPopFanfare();
    giftModal.classList.remove('hidden');
    launchConfetti();
  };

  openGiftBtn.addEventListener('click', openGiftModalHandler);
  threeScene.onGiftClick = openGiftModalHandler;

  closeModalBtn.addEventListener('click', () => giftModal.classList.add('hidden'));
  giftModal.addEventListener('click', (e) => { if (e.target === giftModal) giftModal.classList.add('hidden'); });
  const releaseLanternBtn = document.getElementById('release-lantern-btn');

  releaseLanternBtn?.addEventListener('click', () => {
    threeScene.releaseNewLantern();
    audioSynth.playPopFanfare();
    launchConfetti();
  });

  modalCelebrateBtn.addEventListener('click', launchFireworks);
  fireworksBtn.addEventListener('click', launchFireworks);

  // ===== FEATURE 6: PHOTO MEMORIES LIGHTBOX MODAL =====
  const polaroids = Array.from(document.querySelectorAll('.polaroid-card'));
  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentPhotoIndex = 0;

  const showPhoto = (index) => {
    if (polaroids.length === 0) return;
    currentPhotoIndex = (index + polaroids.length) % polaroids.length;
    const target = polaroids[currentPhotoIndex];
    lightboxImg.src = target.dataset.src;
    lightboxCaption.textContent = target.dataset.caption;
  };

  polaroids.forEach((card, idx) => {
    card.addEventListener('click', () => {
      showPhoto(idx);
      lightbox?.classList.remove('hidden');
      audioSynth.playPopFanfare();
      launchConfetti();
    });
  });

  lightboxClose?.addEventListener('click', () => lightbox?.classList.add('hidden'));
  lightboxPrev?.addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
  lightboxNext?.addEventListener('click', () => showPhoto(currentPhotoIndex + 1));
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
    if (e.key === 'Escape') lightbox.classList.add('hidden');
  });

  // 6. Wish Form (if present)
  const wishForm = document.getElementById('wish-form');
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const wishInput = document.getElementById('wish-input');
      const wishToast = document.getElementById('wish-toast');
      const wishText = wishInput?.value.trim();
      if (!wishText) return;
      audioSynth.playPopFanfare();
      launchConfetti();
      if (wishToast) {
        wishToast.textContent = `🌟 Wish for Murshad: "${wishText}"`;
        wishToast.classList.remove('hidden');
        setTimeout(() => wishToast.classList.add('hidden'), 4000);
      }
      wishInput.value = '';
    });
  }
});

