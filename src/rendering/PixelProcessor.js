/**
 * Photo-to-Pixel-Art Texture Converter Pipeline
 * Transforms real photographs into authentic 16-bit retro pixel art textures:
 * 1. Smart Downsampling to retro resolution
 * 2. Color quantization to a curated nostalgic palette
 * 3. 4x4 Bayer Matrix ordered dithering
 * 4. Contrast & architectural edge preservation
 */

export class PixelProcessor {
  /**
   * Retro 48-Color Palette optimized for Saransk cityscapes, architecture,
   * lush park foliage, cobblestones, sunset skies, and warm street lighting.
   */
  static PALETTE = [
    // 1. Sky & Twilight Blues/Purples
    [16, 12, 28], [28, 20, 48], [48, 32, 78], [74, 48, 108],
    [105, 68, 138], [148, 102, 178], [195, 155, 218], [235, 215, 245],

    // 2. Sunset Glow, Amber, & Warm Lighting
    [255, 235, 180], [255, 195, 95], [245, 135, 55], [215, 75, 45],
    [155, 35, 40], [95, 20, 35], [255, 120, 160], [255, 180, 210],

    // 3. Gold Domes & Highlights (Cathedral of St. Theodore Ushakov)
    [90, 50, 15], [160, 95, 25], [215, 140, 35], [245, 185, 55],
    [255, 220, 105], [255, 250, 210],

    // 4. White/Cream Cathedral Stone & Architecture
    [55, 50, 65], [95, 90, 105], [145, 140, 155], [195, 190, 205],
    [235, 230, 245], [255, 255, 255],

    // 5. Historic Brick, Red Roofs, & Sovetskaya Facades
    [65, 25, 25], [115, 45, 35], [165, 65, 50], [205, 95, 75],

    // 6. Pushkin Park Greens & Trees
    [15, 35, 20], [30, 65, 35], [55, 105, 55], [90, 145, 80], [145, 190, 120],

    // 7. Cobblestone Road & Slate Greys
    [30, 32, 42], [55, 58, 72], [85, 90, 105], [125, 130, 148],

    // 8. Fox Fur Mascot & Autumn Tones
    [140, 50, 15], [195, 85, 25], [235, 125, 40], [255, 175, 70],

    // 9. Deep Shadows & Midnight Void
    [5, 4, 8], [10, 8, 14]
  ];

  // 4x4 Bayer Matrix for ordered dithering
  static BAYER_4X4 = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5]
  ];

  /**
   * Converts a real photographic Image/Canvas into an authentic retro Pixel-Art texture
   */
  static processImageToPixelArt(sourceImg, targetWidth = 160, targetHeight = 110, ditherStrength = 18, contrast = 1.1) {
    const offscreen = document.createElement('canvas');
    offscreen.width = targetWidth;
    offscreen.height = targetHeight;
    const ctx = offscreen.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 1. Draw downscaled
    ctx.drawImage(sourceImg, 0, 0, targetWidth, targetHeight);
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const pixels = imgData.data;

    // 2. Quantize colors with 4x4 Bayer Dithering and contrast boost
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const idx = (y * targetWidth + x) * 4;
        const alpha = pixels[idx + 3];
        if (alpha < 30) continue; // transparent pixel

        let r = pixels[idx];
        let g = pixels[idx + 1];
        let b = pixels[idx + 2];

        // Slight contrast adjustment
        if (contrast !== 1.0) {
          r = Math.min(255, Math.max(0, ((r - 128) * contrast) + 128));
          g = Math.min(255, Math.max(0, ((g - 128) * contrast) + 128));
          b = Math.min(255, Math.max(0, ((b - 128) * contrast) + 128));
        }

        // Bayer threshold offset: range [-0.5, 0.5]
        const bayerVal = (this.BAYER_4X4[y % 4][x % 4] / 16.0 - 0.5) * ditherStrength;

        const ditheredR = Math.min(255, Math.max(0, r + bayerVal));
        const ditheredG = Math.min(255, Math.max(0, g + bayerVal));
        const ditheredB = Math.min(255, Math.max(0, b + bayerVal));

        // Find nearest color in curated palette
        const nearest = this.findNearestPaletteColor(ditheredR, ditheredG, ditheredB);

        pixels[idx] = nearest[0];
        pixels[idx + 1] = nearest[1];
        pixels[idx + 2] = nearest[2];
        pixels[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return offscreen;
  }

  static findNearestPaletteColor(r, g, b) {
    let bestDist = Infinity;
    let bestColor = this.PALETTE[0];

    for (let i = 0; i < this.PALETTE.length; i++) {
      const p = this.PALETTE[i];
      // Weighted Euclidean distance for human perception
      const dr = r - p[0];
      const dg = g - p[1];
      const db = b - p[2];
      const dist = (dr * dr * 0.3) + (dg * dg * 0.59) + (db * db * 0.11);

      if (dist < bestDist) {
        bestDist = dist;
        bestColor = p;
      }
    }

    return bestColor;
  }

  /**
   * Generates a Pixel Art render of the Cathedral of St. Theodore Ushakov in Saransk (fallback)
   */
  static generateSaranskCathedralPixelArt(width = 180, height = 140) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const C = {
      base: '#1a1426',
      wallShadow: '#736d80',
      wallMid: '#bab4c7',
      wallLight: '#ede9f5',
      wallBright: '#ffffff',
      goldDark: '#995c12',
      goldMid: '#d98b1a',
      goldLight: '#f5c038',
      goldGlint: '#fff5be',
      windowDark: '#120d1c',
      windowGlow: '#f09838',
      cross: '#fff0a6'
    };

    const cx = Math.floor(width / 2);

    // Main Cathedral Body
    ctx.fillStyle = C.wallMid;
    ctx.fillRect(cx - 50, height - 85, 100, 85);
    ctx.fillStyle = C.wallLight;
    ctx.fillRect(cx - 35, height - 85, 70, 85);

    // Columns & details
    for (let c = -42; c <= 42; c += 14) {
      ctx.fillStyle = C.wallShadow;
      ctx.fillRect(cx + c - 1, height - 70, 2, 70);
      ctx.fillStyle = C.wallBright;
      ctx.fillRect(cx + c + 1, height - 70, 2, 70);
    }

    // Windows with warm evening glow
    for (let w = -32; w <= 32; w += 20) {
      ctx.fillStyle = C.windowDark;
      ctx.fillRect(cx + w - 4, height - 55, 8, 22);
      ctx.fillStyle = C.windowGlow;
      ctx.fillRect(cx + w - 2, height - 52, 4, 16);
    }

    // Central Drum & Golden Dome
    ctx.fillStyle = C.wallLight;
    ctx.fillRect(cx - 22, height - 110, 44, 25);
    ctx.fillStyle = C.goldDark;
    ctx.beginPath();
    ctx.arc(cx, height - 110, 22, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = C.goldLight;
    ctx.beginPath();
    ctx.arc(cx - 3, height - 110, 17, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = C.goldGlint;
    ctx.fillRect(cx - 10, height - 124, 6, 8);

    // Side Domes
    const drawSideDome = (sx) => {
      ctx.fillStyle = C.wallMid;
      ctx.fillRect(sx - 10, height - 95, 20, 15);
      ctx.fillStyle = C.goldMid;
      ctx.beginPath();
      ctx.arc(sx, height - 95, 11, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = C.goldGlint;
      ctx.fillRect(sx - 3, height - 103, 3, 4);
    };
    drawSideDome(cx - 38);
    drawSideDome(cx + 38);

    // Golden Cross on Top
    ctx.fillStyle = C.cross;
    ctx.fillRect(cx - 1, height - 140, 2, 14);
    ctx.fillRect(cx - 4, height - 135, 8, 2);

    return canvas;
  }

  /**
   * Generates a Pixel Art render of the Saransk Fox mascot (fallback)
   */
  static generateSaranskFoxPixelArt() {
    const canvas = document.createElement('canvas');
    canvas.width = 36;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const C = {
      fur: '#d9531e',
      furDark: '#8f2e0a',
      furLight: '#f28344',
      white: '#ffffff',
      dark: '#140c17',
      eye: '#27ae60'
    };

    // Body
    ctx.fillStyle = C.fur;
    ctx.fillRect(10, 14, 16, 12);
    ctx.fillStyle = C.furDark;
    ctx.fillRect(10, 24, 16, 2);

    // Chest & Tail Tip
    ctx.fillStyle = C.white;
    ctx.fillRect(8, 16, 5, 8);
    ctx.fillRect(26, 8, 6, 6);

    // Tail
    ctx.fillStyle = C.fur;
    ctx.fillRect(22, 12, 8, 10);
    ctx.fillStyle = C.furLight;
    ctx.fillRect(24, 10, 6, 4);

    // Head
    ctx.fillStyle = C.fur;
    ctx.fillRect(4, 8, 12, 10);
    ctx.fillStyle = C.white;
    ctx.fillRect(2, 12, 4, 6); // Muzzle

    // Ears
    ctx.fillStyle = C.furDark;
    ctx.fillRect(6, 4, 3, 4);
    ctx.fillRect(12, 4, 3, 4);
    ctx.fillStyle = C.dark;
    ctx.fillRect(7, 5, 1, 2);
    ctx.fillRect(13, 5, 1, 2);

    // Nose & Eye
    ctx.fillStyle = C.dark;
    ctx.fillRect(2, 14, 2, 2);
    ctx.fillStyle = C.eye;
    ctx.fillRect(7, 10, 2, 2);

    // Paws
    ctx.fillStyle = C.dark;
    ctx.fillRect(10, 26, 3, 4);
    ctx.fillRect(14, 26, 3, 4);
    ctx.fillRect(20, 26, 3, 4);
    ctx.fillRect(24, 26, 3, 4);

    return canvas;
  }
}
