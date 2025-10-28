const { ipcRenderer } = require('electron');

const squiddie = document.getElementById('squiddie');
const petContainer = document.getElementById('pet-container');
const heartOverlay = document.getElementById('heart-overlay');
const messageOverlay = document.getElementById('message-overlay');
const sleepOverlay = document.getElementById('sleep-overlay');
const feedBtn = document.getElementById('feed-btn');
const soundToggle = document.getElementById('sound-toggle');

let isIdle = false;
let soundEnabled = true;
let lastActivity = Date.now();
let isDragging = false;
let offsetX, offsetY;
let posX = 100, posY = 100;
let dirAngle = Math.random() * 2 * Math.PI;
let clickCount = 0, clickTimer;

// Audio
const purrSound = new Audio('sounds/purr.wav');
const bubbleSound = new Audio('sounds/bubble.wav');

// Screen size
const screenWidth = window.screen.availWidth;
const screenHeight = window.screen.availHeight;

// Mouse position
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.screenX;
  mouseY = e.screenY;
});

function getDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function walkStep() {
  if (isDragging || isIdle) return;
  const step = 2;
  let targetX, targetY;

  const angle = Math.atan2(mouseY - (posY + 64), mouseX - (posX + 64));
  targetX = posX + Math.cos(angle) * step;
  targetY = posY + Math.sin(angle) * step;

  if (targetX < 0 || targetX > screenWidth - 128) dirAngle = Math.PI - dirAngle;
  if (targetY < 0 || targetY > screenHeight - 128) dirAngle = -dirAngle;

  posX = Math.max(0, Math.min(targetX, screenWidth - 128));
  posY = Math.max(0, Math.min(targetY, screenHeight - 128));

  ipcRenderer.send('move-window', posX, posY);

  squiddie.src = squiddie.src.includes('W1') ? 'images/W2.png' : 'images/W1.png';
}

let walkInterval = setInterval(walkStep, 150);

function startWalking() {
  isIdle = false;
  clearInterval(walkInterval);
  walkInterval = setInterval(walkStep, 150);
}

function goIdle() {
  isIdle = true;
  squiddie.src = 'images/DE.png';
  if (soundEnabled) purrSound.play();
}

setInterval(() => {
  const idleTime = Date.now() - lastActivity;
  if (!isIdle && idleTime > 20000) goIdle();
  if (isIdle && idleTime > 40000) sleepOverlay.style.opacity = 1;
  else sleepOverlay.style.opacity = 0;
}, 1000);

const cuteMessages = [
  "Mommy, I'm hungry 🍪",
  "I want a cuddle 💖",
  "I'm sleepy… 😴",
  "Can we play together? 🐙",
  "I love you, Mommy! 💕",
  "Do you want to hear a song? 🎶",
  "I missed you! 😽"
];

function showMessage(msg) {
  messageOverlay.textContent = msg;
  messageOverlay.style.opacity = 1;
  messageOverlay.style.transform = 'translateX(-50%) translateY(-10px)';
  setTimeout(() => {
    messageOverlay.style.opacity = 0;
    messageOverlay.style.transform = 'translateX(-50%) translateY(0px)';
  }, 4000);
}

function randomMessage() {
  const msg = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
  showMessage(msg);
  const nextTime = 45000 + Math.random() * 45000;
  setTimeout(randomMessage, nextTime);
}
randomMessage();

squiddie.addEventListener('click', () => {
  lastActivity = Date.now();
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    if (clickCount === 1) {
      if (isIdle) startWalking();
      squiddie.src = 'images/UE.png';
      heartOverlay.style.opacity = 1;
      if (soundEnabled) bubbleSound.play();
      setTimeout(() => {
        heartOverlay.style.opacity = 0;
        if (!isIdle) startWalking();
      }, 1500);
    } else if (clickCount === 2) {
      if (isIdle) startWalking();
      squiddie.src = 'images/ET1.png';
      setTimeout(() => squiddie.src = 'images/ET2.png', 2000);
      setTimeout(() => startWalking(), 6000);
    } else if (clickCount >= 3) {
      squiddie.src = 'images/UE.png';
      if (soundEnabled) purrSound.play();
      setTimeout(() => startWalking(), 2000);
    }
    clickCount = 0;
  }, 400);
});

feedBtn.addEventListener('click', () => {
  lastActivity = Date.now();
  if (isIdle) startWalking();
  squiddie.src = 'images/ET1.png';
  setTimeout(() => squiddie.src = 'images/ET2.png', 2000);
  setTimeout(() => startWalking(), 6000);
});

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? 'Sound On' : 'Sound Off';
});

petContainer.addEventListener('mousedown', e => {
  isDragging = true;
  offsetX = e.screenX - posX;
  offsetY = e.screenY - posY;
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  posX = e.screenX - offsetX;
  posY = e.screenY - offsetY;
  ipcRenderer.send('move-window', posX, posY);
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    startWalking();
  }
});

startWalking();
