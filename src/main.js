import { Game2D } from './core/Game2D.js';

function start() {
  if (window.__ALICE_GAME__) return;
  try {
    const game = new Game2D();
    window.__ALICE_GAME__ = game;
    console.log("✧ Alice in Pixel Saransk 2D Engine Initialized! ✧");
  } catch (err) {
    console.error("Error starting Game2D:", err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
