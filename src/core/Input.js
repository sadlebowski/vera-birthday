/**
 * Universal Input Manager for Desktop (Keyboard) and Mobile (Touch buttons)
 */

export class InputManager {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      jump: false,
      action: false
    };

    this.touchActive = {
      left: false,
      right: false,
      jump: false
    };

    this.jumpPressedThisFrame = false;
    this.actionPressedThisFrame = false;

    this.initKeyboard();
    this.initTouchControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Space or ArrowUp or W for jump
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!this.keys.jump) {
          this.jumpPressedThisFrame = true;
        }
        this.keys.jump = true;
        e.preventDefault();
      }

      // Left: ArrowLeft, KeyA
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.keys.left = true;
      }

      // Right: ArrowRight, KeyD
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.keys.right = true;
      }

      // Action: Enter, KeyE
      if (e.code === 'Enter' || e.code === 'KeyE') {
        if (!this.keys.action) {
          this.actionPressedThisFrame = true;
        }
        this.keys.action = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.keys.jump = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.keys.right = false;
      }
      if (e.code === 'Enter' || e.code === 'KeyE') {
        this.keys.action = false;
      }
    });
  }

  initTouchControls() {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');

    const bindTouch = (el, key) => {
      if (!el) return;

      const start = (e) => {
        e.preventDefault();
        this.touchActive[key] = true;
        if (key === 'jump') {
          this.jumpPressedThisFrame = true;
        }
      };

      const end = (e) => {
        e.preventDefault();
        this.touchActive[key] = false;
      };

      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
      el.addEventListener('touchcancel', end, { passive: false });

      // Fallback for mouse on mobile testing
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
    };

    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
    bindTouch(btnJump, 'jump');
  }

  get isLeft() {
    return this.keys.left || this.touchActive.left;
  }

  get isRight() {
    return this.keys.right || this.touchActive.right;
  }

  get isJump() {
    return this.keys.jump || this.touchActive.jump;
  }

  consumeJump() {
    const pressed = this.jumpPressedThisFrame;
    this.jumpPressedThisFrame = false;
    return pressed;
  }

  consumeAction() {
    const pressed = this.actionPressedThisFrame;
    this.actionPressedThisFrame = false;
    return pressed;
  }

  reset() {
    this.keys.left = false;
    this.keys.right = false;
    this.keys.jump = false;
    this.keys.action = false;
    this.touchActive.left = false;
    this.touchActive.right = false;
    this.touchActive.jump = false;
    this.jumpPressedThisFrame = false;
    this.actionPressedThisFrame = false;
  }
}
