import { BackgroundConfig, GradientPreset } from '../types/snap';

/**
 * Curated High-End Studio Gradients.
 * Strictly adheres to project color constraints:
 * Primary: Indigo (#4F46E5, #6366F1), Purple (#9D4EDD, #C77DFF)
 * Secondary: Cyan (#22D3EE), Soft Emerald (#58DB91)
 * Tech Dark: Deep Slate, Obsidian, Onyx.
 * NO corporate dark blue or orange.
 */
export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'hyper-indigo',
    name: 'Hyper Indigo',
    dominantColor: '#6366F1',
    tags: ['indigo', 'purple'],
    css: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 35%, #7C3AED 70%, #A855F7 100%)',
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    dominantColor: '#9D4EDD',
    tags: ['purple'],
    css: 'linear-gradient(140deg, #18052e 0%, #4a0072 40%, #9D4EDD 75%, #C77DFF 100%)',
  },
  {
    id: 'deep-space-nebula',
    name: 'Deep Nebula',
    dominantColor: '#7928CA',
    tags: ['purple', 'indigo', 'cyan'],
    css: 'radial-gradient(circle at 20% 20%, #4F46E5 0%, #1e1035 50%, #0d0614 100%), linear-gradient(135deg, #7928CA 0%, #000000 100%)',
  },
  {
    id: 'aurora-borealis',
    name: 'Cyan Aurora',
    dominantColor: '#22D3EE',
    tags: ['cyan', 'emerald', 'indigo'],
    css: 'linear-gradient(135deg, #0e2a36 0%, #0891b2 40%, #22D3EE 70%, #58DB91 100%)',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Core',
    dominantColor: '#58DB91',
    tags: ['emerald', 'cyan'],
    css: 'linear-gradient(135deg, #062817 0%, #059669 45%, #10B981 75%, #58DB91 100%)',
  },
  {
    id: 'synthwave-glow',
    name: 'Synth Glow',
    dominantColor: '#C026D3',
    tags: ['purple', 'indigo'],
    css: 'linear-gradient(135deg, #31103f 0%, #701a75 35%, #9333ea 70%, #38bdf8 100%)',
  },
  {
    id: 'dark-obsidian',
    name: 'Dark Obsidian',
    dominantColor: '#3F3F46',
    tags: ['dark'],
    css: 'linear-gradient(145deg, #18181B 0%, #09090B 50%, #121217 100%)',
  },
  {
    id: 'monolith-slate',
    name: 'Monolith Minimal',
    dominantColor: '#27272A',
    tags: ['dark'],
    css: 'linear-gradient(180deg, #202027 0%, #111115 100%)',
  },
  {
    id: 'cyber-mesh',
    name: 'Cyber Horizon',
    dominantColor: '#6366F1',
    tags: ['indigo', 'cyan'],
    css: 'radial-gradient(at 100% 0%, #4F46E5 0px, transparent 50%), radial-gradient(at 0% 100%, #22D3EE 0px, transparent 50%), linear-gradient(135deg, #09090B 0%, #181824 100%)',
  },
  {
    id: 'pure-midnight',
    name: 'Pure Midnight',
    dominantColor: '#1E1B4B',
    tags: ['dark', 'indigo'],
    css: 'linear-gradient(160deg, #0f0d1b 0%, #09090B 100%)',
  },
];

/**
 * Generates an optimized SVG feTurbulence Noise DataURI in real time.
 * Perfect for zero-bandwidth film grain rendering.
 */
export function generateSvgNoiseDataUri(baseFrequency: number = 0.65, numOctaves: number = 3): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="1" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Procedural Mesh Gradient Generator based on 4 customizable focal coordinates.
 */
export function generateMeshGradientCss(colors: [string, string, string, string]): string {
  const [c1, c2, c3, c4] = colors;
  return `
    radial-gradient(circle at 15% 15%, ${c1} 0%, transparent 55%),
    radial-gradient(circle at 85% 20%, ${c2} 0%, transparent 50%),
    radial-gradient(circle at 80% 85%, ${c3} 0%, transparent 55%),
    radial-gradient(circle at 20% 80%, ${c4} 0%, transparent 50%),
    #09090B
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Resolves full background style for the canvas stage.
 */
export function resolveBackgroundStyle(config: BackgroundConfig): {
  background: string;
  isTransparent: boolean;
} {
  if (config.type === 'transparent') {
    return {
      background: 'transparent',
      isTransparent: true,
    };
  }

  if (config.type === 'solid') {
    return {
      background: config.solidColor || '#09090B',
      isTransparent: false,
    };
  }

  if (config.type === 'mesh') {
    return {
      background: generateMeshGradientCss(config.meshColors),
      isTransparent: false,
    };
  }

  // Gradient preset
  const preset = GRADIENT_PRESETS.find((p) => p.id === config.gradientId);
  if (preset) {
    return {
      background: preset.css,
      isTransparent: false,
    };
  }

  // Custom or fallback
  return {
    background: config.customGradient || GRADIENT_PRESETS[0].css,
    isTransparent: false,
  };
}

/**
 * Finds dominant color of active background config for reactive colored glow.
 */
export function getDominantColor(config: BackgroundConfig): string {
  if (config.type === 'solid') {
    return config.solidColor;
  }
  if (config.type === 'mesh') {
    return config.meshColors[0] || '#6366F1';
  }
  const preset = GRADIENT_PRESETS.find((p) => p.id === config.gradientId);
  return preset ? preset.dominantColor : '#6366F1';
}
