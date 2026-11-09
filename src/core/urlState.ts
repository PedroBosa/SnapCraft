import { SnapPreset } from '../types/snap';

/**
 * Compact, URL-safe Base64 encoder supporting full UTF-8 Unicode characters
 * (emojis, special math symbols, non-ASCII scripts).
 */
export function encodeSnapToUrl(data: SnapPreset['state']): string {
  try {
    const jsonStr = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // Convert to URL-safe base64: '+' -> '-', '/' -> '_', '=' stripped
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode snap state to URL string:', err);
    return '';
  }
}

/**
 * Decodes URL-safe Base64 string back into state.
 */
export function decodeSnapFromUrl(urlHashOrQuery: string): Partial<SnapPreset['state']> | null {
  try {
    let clean = urlHashOrQuery;
    if (clean.includes('snap=')) {
      const match = clean.match(/[?&]snap=([^&]+)/);
      if (match) {
        clean = match[1];
      }
    }

    // Convert back from URL-safe base64
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4 !== 0) {
      clean += '=';
    }

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr) as Partial<SnapPreset['state']>;
  } catch (err) {
    console.warn('Failed to parse snap state from URL parameter:', err);
    return null;
  }
}
