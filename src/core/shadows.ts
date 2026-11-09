import { ShadowConfig, ShadowPreset } from '../types/snap';

/**
 * Mathematical Layered Ambient Occlusion (LAO) Box-Shadow Generator.
 * Creates physically plausible light attenuation across 5 diffuse layers:
 * 1. Umbra / Contact Shadow (sharp, high opacity, immediate proximity)
 * 2. Penumbra Near (soft edge definition)
 * 3. Mid-range Ambient Dispersion
 * 4. Wide Field Occlusion
 * 5. Far Atmospheric Falloff
 */

interface ComputedShadow {
  boxShadow: string;
  filter?: string;
}

export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  let r = 0;
  let g = 0;
  let b = 0;

  if (sanitized.length === 3) {
    r = parseInt(sanitized[0] + sanitized[0], 16);
    g = parseInt(sanitized[1] + sanitized[1], 16);
    b = parseInt(sanitized[2] + sanitized[2], 16);
  } else if (sanitized.length === 6) {
    r = parseInt(sanitized.substring(0, 2), 16);
    g = parseInt(sanitized.substring(2, 4), 16);
    b = parseInt(sanitized.substring(4, 6), 16);
  } else {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

export function generateLayeredShadow(
  config: ShadowConfig,
  dominantGlowColor: string = '#6366F1'
): ComputedShadow {
  const { preset, elevation, lightAngle, coloredGlow, glowIntensity } = config;

  if (preset === 'none' || elevation <= 0) {
    return {
      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 2px rgba(0, 0, 0, 0.2)',
    };
  }

  // Calculate X and Y light direction offsets from lightAngle (degrees)
  // 90 degrees is directly from above (downwards shadow)
  const angleRad = (lightAngle * Math.PI) / 180;
  const dirX = Math.cos(angleRad);
  const dirY = Math.sin(angleRad);

  // Normalize elevation ratio [0 .. 1]
  const e = Math.max(1, Math.min(100, elevation)) / 50; // default 50 => 1.0

  let layers: string[] = [];

  switch (preset) {
    case 'subtle': {
      const s = e * 0.6;
      layers = [
        `${(dirX * 0.5 * s).toFixed(1)}px ${(dirY * 1 * s).toFixed(1)}px ${(1.5 * s).toFixed(1)}px rgba(0, 0, 0, 0.35)`,
        `${(dirX * 1 * s).toFixed(1)}px ${(dirY * 2.5 * s).toFixed(1)}px ${(4 * s).toFixed(1)}px rgba(0, 0, 0, 0.25)`,
        `${(dirX * 2 * s).toFixed(1)}px ${(dirY * 6 * s).toFixed(1)}px ${(10 * s).toFixed(1)}px rgba(0, 0, 0, 0.18)`,
        `${(dirX * 4 * s).toFixed(1)}px ${(dirY * 12 * s).toFixed(1)}px ${(20 * s).toFixed(1)}px rgba(0, 0, 0, 0.12)`,
        `${(dirX * 6 * s).toFixed(1)}px ${(dirY * 24 * s).toFixed(1)}px ${(40 * s).toFixed(1)}px rgba(0, 0, 0, 0.08)`,
      ];
      break;
    }

    case 'dreamy': {
      const d = e * 1.25;
      layers = [
        `${(dirX * 0.6 * d).toFixed(1)}px ${(dirY * 1.5 * d).toFixed(1)}px ${(3 * d).toFixed(1)}px rgba(0, 0, 0, 0.25)`,
        `${(dirX * 2 * d).toFixed(1)}px ${(dirY * 5 * d).toFixed(1)}px ${(12 * d).toFixed(1)}px rgba(0, 0, 0, 0.22)`,
        `${(dirX * 5 * d).toFixed(1)}px ${(dirY * 15 * d).toFixed(1)}px ${(30 * d).toFixed(1)}px rgba(0, 0, 0, 0.20)`,
        `${(dirX * 10 * d).toFixed(1)}px ${(dirY * 30 * d).toFixed(1)}px ${(60 * d).toFixed(1)}px rgba(0, 0, 0, 0.18)`,
        `${(dirX * 18 * d).toFixed(1)}px ${(dirY * 55 * d).toFixed(1)}px ${(100 * d).toFixed(1)}px rgba(0, 0, 0, 0.14)`,
      ];
      break;
    }

    case 'colored-glow': {
      const gColor = config.glowColor || dominantGlowColor;
      const intensity = glowIntensity ?? 0.65;
      const c = e * 1.1;

      layers = [
        // Sharp dark contact base
        `${(dirX * 0.8 * c).toFixed(1)}px ${(dirY * 2 * c).toFixed(1)}px ${(4 * c).toFixed(1)}px rgba(0, 0, 0, 0.40)`,
        `${(dirX * 2.5 * c).toFixed(1)}px ${(dirY * 6 * c).toFixed(1)}px ${(14 * c).toFixed(1)}px rgba(0, 0, 0, 0.30)`,
        // Colored atmospheric glow layers
        `0px ${(dirY * 12 * c).toFixed(1)}px ${(28 * c).toFixed(1)}px ${hexToRgba(gColor, 0.35 * intensity)}`,
        `0px ${(dirY * 28 * c).toFixed(1)}px ${(65 * c).toFixed(1)}px ${hexToRgba(gColor, 0.28 * intensity)}`,
        `0px ${(dirY * 50 * c).toFixed(1)}px ${(110 * c).toFixed(1)}px ${hexToRgba(gColor, 0.18 * intensity)}`,
      ];
      break;
    }

    case 'elevated':
    case 'custom':
    default: {
      // 5-layer linear/exponential ambient occlusion attenuation
      layers = [
        // Layer 1: Contact
        `${(dirX * 0.5 * e).toFixed(1)}px ${(dirY * 1 * e).toFixed(1)}px ${(2 * e).toFixed(1)}px rgba(0, 0, 0, 0.45)`,
        // Layer 2: Penumbra
        `${(dirX * 1.5 * e).toFixed(1)}px ${(dirY * 3 * e).toFixed(1)}px ${(7 * e).toFixed(1)}px rgba(0, 0, 0, 0.32)`,
        // Layer 3: Mid-range ambient
        `${(dirX * 3.5 * e).toFixed(1)}px ${(dirY * 8 * e).toFixed(1)}px ${(18 * e).toFixed(1)}px rgba(0, 0, 0, 0.26)`,
        // Layer 4: Distant falloff
        `${(dirX * 7 * e).toFixed(1)}px ${(dirY * 18 * e).toFixed(1)}px ${(38 * e).toFixed(1)}px rgba(0, 0, 0, 0.20)`,
        // Layer 5: Umbrella soft boundary
        `${(dirX * 12 * e).toFixed(1)}px ${(dirY * 36 * e).toFixed(1)}px ${(75 * e).toFixed(1)}px rgba(0, 0, 0, 0.15)`,
      ];

      // Add extra colored glow aura if toggled on elevated/custom
      if (coloredGlow) {
        const gColor = config.glowColor || dominantGlowColor;
        const intensity = glowIntensity ?? 0.5;
        layers.push(
          `0px ${(dirY * 20 * e).toFixed(1)}px ${(60 * e).toFixed(1)}px ${hexToRgba(gColor, 0.22 * intensity)}`
        );
      }
      break;
    }
  }

  // Specular Top Inset Edge + Outer Micro-Ring (Apple/Figma/CleanShot specification)
  const specularEdge = 'inset 0 1px 0 0 rgba(255, 255, 255, 0.16)';
  const innerDarkRing = 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)';
  const outerBorder = '0 0 0 1px rgba(0, 0, 0, 0.5)';

  const fullBoxShadow = [
    specularEdge,
    innerDarkRing,
    outerBorder,
    ...layers,
  ].join(', ');

  return {
    boxShadow: fullBoxShadow,
  };
}

export const SHADOW_PRESETS: { id: ShadowPreset; label: string; elevation: number }[] = [
  { id: 'none', label: 'None', elevation: 0 },
  { id: 'subtle', label: 'Subtle', elevation: 25 },
  { id: 'elevated', label: 'Elevated', elevation: 50 },
  { id: 'dreamy', label: 'Dreamy', elevation: 80 },
  { id: 'colored-glow', label: 'Colored Glow', elevation: 65 },
  { id: 'custom', label: 'Custom', elevation: 50 },
];
