/**
 * PS1 / Retro Tumblr Soft Dithering Post-Processing Shader
 * Implements 4x4 Bayer Matrix ordered dithering with subtle color quantization.
 */

export const DitherShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: null },
    colorDepth: { value: 24.0 }, // Color levels per channel (soft retro look)
    ditherStrength: { value: 0.25 }, // Subtle texture without hurting photo readability
    pixelSize: { value: 1.5 } // Subtle pixelation scaling
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float colorDepth;
    uniform float ditherStrength;
    uniform float pixelSize;
    varying vec2 vUv;

    // 4x4 Bayer Matrix
    float bayer4(vec2 uv) {
      int x = int(mod(uv.x, 4.0));
      int y = int(mod(uv.y, 4.0));
      
      int index = x + y * 4;
      float bayer[16] = float[16](
         0.0/16.0, 12.0/16.0,  3.0/16.0, 15.0/16.0,
         8.0/16.0,  4.0/16.0, 11.0/16.0,  7.0/16.0,
         2.0/16.0, 14.0/16.0,  1.0/16.0, 13.0/16.0,
        10.0/16.0,  6.0/16.0,  9.0/16.0,  5.0/16.0
      );
      
      return bayer[index] - 0.5;
    }

    void main() {
      // Coordinate pixelation
      vec2 coord = vUv;
      if (pixelSize > 1.0) {
        vec2 grid = resolution / pixelSize;
        coord = floor(vUv * grid) / grid;
      }

      vec4 texColor = texture2D(tDiffuse, coord);
      
      // Calculate screen pixel position for Bayer matrix
      vec2 screenPos = floor(gl_FragCoord.xy / pixelSize);
      float ditherValue = bayer4(screenPos) * ditherStrength;

      // Apply dither to RGB channels
      vec3 dithered = texColor.rgb + vec3(ditherValue / colorDepth);
      
      // Quantize
      vec3 quantized = floor(dithered * colorDepth + 0.5) / colorDepth;

      // Soft vignette and warm romantic tint
      float distFromCenter = distance(vUv, vec2(0.5));
      float vignette = clamp(1.0 - distFromCenter * 0.45, 0.0, 1.0);
      
      // Warm pink-purple ambient glow for Tumblr aesthetic
      vec3 warmTint = vec3(1.02, 0.98, 1.03);

      gl_FragColor = vec4(quantized * vignette * warmTint, texColor.a);
    }
  `
};
