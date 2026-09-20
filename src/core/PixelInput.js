/**
 * Pixel Input Manager (Keyboard & Touch Buttons)
 * Supports English and Russian keyboard layouts (WASD / ФЦЫВ), F / А (Inspect), Arrows, Space, Enter, E
 */
export class PixelInput {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      action: false,
      inspect: false,
      shift: false
    };

    this.rawKeys = {};

    this.jumpPressed = false;
    this.actionPressed = false;
    this.inspectPressed = false;
    this.petPressed = false;

    this.initKeyboard();
    this.initTouch();
  }

  initKeyboard() {
    const isLeftKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft' || key === 'ф';
    };

    const isRightKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright' || key === 'в';
    };

    const isUpKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup' || key === 'ц';
    };

    const isDownKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown' || key === 'ы';
    };

    const isJumpKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'Space' || code === 'KeyW' || code === 'ArrowUp' || key === ' ' || key === 'spacebar' || key === 'w' || key === 'arrowup' || key === 'ц';
    };

    const isInspectKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'KeyF' || key === 'f' || key === 'а' || key === 'a'; // English F or Russian А
    };

    const isPetKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'KeyE' || key === 'e' || key === 'у'; // English E or Russian У
    };

    const isActionKey = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      return code === 'Enter' || code === 'KeyE' || key === 'enter' || key === 'e' || key === 'у' || isInspectKey(e);
    };

    window.addEventListener('keydown', (e) => {
      if (e.code) this.rawKeys[e.code] = true;
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.keys.shift = true;
      }
      if (isLeftKey(e)) {
        this.keys.left = true;
      }
      if (isRightKey(e)) {
        this.keys.right = true;
      }
      if (isUpKey(e)) {
        this.keys.up = true;
      }
      if (isDownKey(e)) {
        this.keys.down = true;
      }
      if (isJumpKey(e)) {
        if (!this.keys.jump) this.jumpPressed = true;
        this.keys.jump = true;
        e.preventDefault();
      }
      if (isPetKey(e)) {
        this.petPressed = true;
      }
      if (isInspectKey(e)) {
        if (!this.keys.inspect) this.inspectPressed = true;
        this.keys.inspect = true;
      }
      if (isActionKey(e)) {
        if (!this.keys.action) this.actionPressed = true;
        this.keys.action = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) this.rawKeys[e.code] = false;
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.keys.shift = false;
      }
      if (isLeftKey(e)) {
        this.keys.left = false;
      }
      if (isRightKey(e)) {
        this.keys.right = false;
      }
      if (isUpKey(e)) {
        this.keys.up = false;
      }
      if (isDownKey(e)) {
        this.keys.down = false;
      }
      if (isJumpKey(e)) {
        this.keys.jump = false;
      }
      if (isInspectKey(e)) {
        this.keys.inspect = false;
      }
      if (isActionKey(e)) {
        this.keys.action = false;
      }
    });
  }

  initTouch() {
    this.dirHoldTimer = null;

    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;

      let isDown = false;

      const handleDown = (e) => {
        if (e && e.cancelable) e.preventDefault();
        if (isDown) return;
        isDown = true;
        el.classList.add('active');
        onDown();
      };

      const handleUp = (e) => {
        if (e && e.cancelable) e.preventDefault();
        if (!isDown) return;
        isDown = false;
        el.classList.remove('active');
        onUp();
      };

      // Multi-touch support
      el.addEventListener('touchstart', handleDown, { passive: false });
      el.addEventListener('touchend', handleUp, { passive: false });
      el.addEventListener('touchcancel', handleUp, { passive: false });

      // Pointer events for hybrid touch/mouse support
      el.addEventListener('pointerdown', handleDown);
      el.addEventListener('pointerup', handleUp);
      el.addEventListener('pointercancel', handleUp);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    };

    const startDirHold = () => {
      clearTimeout(this.dirHoldTimer);
      // Holding direction for >260ms smoothly transitions from walk to brisk run
      this.dirHoldTimer = setTimeout(() => {
        if (this.keys.left || this.keys.right) {
          this.keys.shift = true;
        }
      }, 260);
    };

    const endDirHold = () => {
      clearTimeout(this.dirHoldTimer);
      this.keys.shift = false;
    };

    bindBtn('touch-left', () => {
      this.keys.left = true;
      startDirHold();
    }, () => {
      this.keys.left = false;
      endDirHold();
    });

    bindBtn('touch-right', () => {
      this.keys.right = true;
      startDirHold();
    }, () => {
      this.keys.right = false;
      endDirHold();
    });

    bindBtn('touch-jump', () => {
      if (!this.keys.jump) this.jumpPressed = true;
      this.keys.jump = true;
    }, () => {
      this.keys.jump = false;
    });

    bindBtn('touch-action', () => {
      if (!this.keys.action) this.actionPressed = true;
      if (!this.keys.inspect) this.inspectPressed = true;
      this.petPressed = true;
      this.keys.action = true;
      this.keys.inspect = true;
    }, () => {
      this.keys.action = false;
      this.keys.inspect = false;
    });

    const bindUp = (id) => {
      bindBtn(id, () => {
        this.keys.up = true;
      }, () => {
        this.keys.up = false;
      });
    };
    bindUp('touch-up');
    bindUp('touch-flight-up');

    const bindDown = (id) => {
      bindBtn(id, () => {
        this.keys.down = true;
      }, () => {
        this.keys.down = false;
      });
    };
    bindDown('touch-down');
    bindDown('touch-flight-down');
  }

  get isLeft() { return this.keys.left; }
  get isRight() { return this.keys.right; }
  get isUp() { return this.keys.up; }
  get isDown() { return this.keys.down; }
  get isJump() { return this.keys.jump; }
  get isRun() { return this.keys.shift; }

  consumeJump() {
    const val = this.jumpPressed;
    this.jumpPressed = false;
    return val;
  }

  consumeAction() {
    const val = this.actionPressed;
    this.actionPressed = false;
    return val;
  }

  consumePet() {
    const val = this.petPressed;
    this.petPressed = false;
    return val;
  }

  consumeInspect() {
    const val = this.inspectPressed || this.actionPressed;
    this.inspectPressed = false;
    this.actionPressed = false;
    return val;
  }
}
