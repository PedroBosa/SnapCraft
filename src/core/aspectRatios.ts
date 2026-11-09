import { AspectRatioDimension, AspectRatioPreset } from '../types/snap';

export const ASPECT_RATIO_PRESETS: AspectRatioDimension[] = [
  { id: 'auto', label: 'Auto (Fit Content)' },
  { id: '16:9', label: '16:9 Standard', ratio: 16 / 9 },
  { id: '4:3', label: '4:3 Presentation', ratio: 4 / 3 },
  { id: '1:1', label: '1:1 Square', ratio: 1 },
  { id: 'x-post', label: 'X / LinkedIn (1200×675)', width: 1200, height: 675, ratio: 1200 / 675 },
  { id: 'og-image', label: 'OpenGraph (1200×630)', width: 1200, height: 630, ratio: 1200 / 630 },
];

export function resolveStageDimensions(
  preset: AspectRatioPreset
): { width?: number; height?: number; aspectRatio?: string } {
  const found = ASPECT_RATIO_PRESETS.find((p) => p.id === preset);

  if (!found || found.id === 'auto') {
    return {};
  }

  if (found.width && found.height) {
    return {
      aspectRatio: `${found.width} / ${found.height}`,
    };
  }

  if (found.ratio) {
    return {
      aspectRatio: `${found.ratio}`,
    };
  }

  return {};
}
