import { toBlob, toPng, toSvg } from 'html-to-image';
import { ExportFormat, ExportScale } from '../types/snap';

export interface ExportOptions {
  scale: ExportScale;
  format: ExportFormat;
  quality?: number; // 0.0 to 1.0 (for webp / jpeg)
  filename?: string;
}

export interface ExportProgress {
  status: 'idle' | 'rendering' | 'success' | 'error';
  message?: string;
}

/**
 * Filter function to skip non-renderable studio handles or overlays if any.
 */
function defaultFilter(node: HTMLElement): boolean {
  if (node.classList?.contains('stage-ignore-export')) {
    return false;
  }
  return true;
}

/**
 * High-density rasterization pipeline with pixelRatio scaling (1x, 2x, 4x / 4K).
 */
export async function exportStageToBlob(
  stageElement: HTMLElement,
  options: ExportOptions
): Promise<Blob> {
  const pixelRatio = options.scale;
  const quality = options.quality ?? 0.95;

  const htmlToImageOptions = {
    pixelRatio,
    filter: defaultFilter,
    skipFonts: false,
    cacheBust: true,
    width: stageElement.offsetWidth,
    height: stageElement.offsetHeight,
  };

  if (options.format === 'svg') {
    const dataUri = await toSvg(stageElement, htmlToImageOptions);
    const svgContent = decodeURIComponent(dataUri.replace('data:image/svg+xml;charset=utf-8,', ''));
    return new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  }

  if (options.format === 'webp') {
    // html-to-image doesn't have direct toWebp on all versions, so we use toBlob or canvas conversion
    const blob = await toBlob(stageElement, {
      ...htmlToImageOptions,
      type: 'image/webp',
      quality,
    });
    if (!blob) {
      throw new Error('Failed to generate WebP blob from stage element');
    }
    return blob;
  }

  // Default PNG
  const blob = await toBlob(stageElement, {
    ...htmlToImageOptions,
    type: 'image/png',
  });

  if (!blob) {
    throw new Error('Failed to generate PNG blob from stage element');
  }

  return blob;
}

/**
 * Generates high-density PNG Data URL for preview or download.
 */
export async function exportStageToDataUrl(
  stageElement: HTMLElement,
  scale: ExportScale = 2
): Promise<string> {
  return await toPng(stageElement, {
    pixelRatio: scale,
    filter: defaultFilter,
    skipFonts: false,
    cacheBust: true,
    width: stageElement.offsetWidth,
    height: stageElement.offsetHeight,
  });
}

/**
 * Downloads the exported graphic directly with automatic link triggering.
 */
export async function downloadStageExport(
  stageElement: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const blob = await exportStageToBlob(stageElement, options);
  const extension = options.format;
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const name = options.filename ? `${options.filename}.${extension}` : `snapcraft-${dateStr}.${extension}`;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

/**
 * Instant one-click copy to clipboard via ClipboardItem API.
 * Always copies standard uncompressed PNG for universal compatibility across Figma, Slack, Discord, Linear, etc.
 */
export async function copyStageToClipboard(
  stageElement: HTMLElement,
  scale: ExportScale = 2
): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('ClipboardItem API is not supported in this browser environment');
  }

  const blob = await exportStageToBlob(stageElement, {
    scale,
    format: 'png',
  });

  const clipboardItem = new ClipboardItem({
    'image/png': blob,
  });

  await navigator.clipboard.write([clipboardItem]);
  return true;
}
