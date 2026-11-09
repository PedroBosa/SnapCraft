import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AnnotationItem,
  AspectRatioPreset,
  BackgroundConfig,
  CameraPreset,
  CanvasConfig,
  CodeConfig,
  ExportFormat,
  ExportScale,
  ScreenshotConfig,
  ShadowConfig,
  SnapMode,
  SnapPreset,
  StageAlignment,
  Transform3DConfig,
  WatermarkConfig,
  WindowConfig,
} from '../types/snap';
import { decodeSnapFromUrl, encodeSnapToUrl } from '../core/urlState';
import { STUDIO_TEMPLATES } from '../core/templates';

const DEFAULT_CODE_SAMPLE = `import { useState, useEffect } from 'react';

// Procedural Ambient Occlusion & Specular Lighting
export function useLayeredOcclusion(elevation = 50) {
  const [layers, setLayers] = useState<string[]>([]);

  useEffect(() => {
    // 5-layer physical falloff calculation
    const attenuation = [
      \`0 1px 2px rgba(0, 0, 0, 0.45)\`,
      \`0 3px 7px rgba(0, 0, 0, 0.32)\`,
      \`0 8px 18px rgba(0, 0, 0, 0.26)\`,
      \`0 18px 38px rgba(0, 0, 0, 0.20)\`,
      \`0 36px 75px rgba(99, 102, 241, 0.25)\`,
    ];
    setLayers(attenuation);
  }, [elevation]);

  return { layers, isGlowActive: true };
}`;

export const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  frameStyle: 'macos-dark',
  title: 'useLayeredOcclusion.ts',
  showTitle: true,
  showControls: true,
  borderRadius: 14,
  glassOpacity: 0.95,
  backdropBlur: 20,
  insetBorder: true,
  width: undefined,
};

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: 'gradient',
  gradientId: 'hyper-indigo',
  solidColor: '#09090B',
  noiseOpacity: 0.08,
  meshColors: ['#4F46E5', '#9D4EDD', '#22D3EE', '#09090B'],
  angle: 135,
};

export const DEFAULT_SHADOW_CONFIG: ShadowConfig = {
  preset: 'elevated',
  elevation: 50,
  lightAngle: 90,
  coloredGlow: true,
  glowIntensity: 0.6,
  glowColor: '#6366F1',
};

export const DEFAULT_TRANSFORM3D_CONFIG: Transform3DConfig = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  perspective: 1200,
  cameraPreset: 'flat',
};

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  paddingX: 64,
  paddingY: 64,
  aspectRatio: 'auto',
  scale: 1,
  alignment: 'center',
};

export const DEFAULT_CODE_CONFIG: CodeConfig = {
  code: DEFAULT_CODE_SAMPLE,
  language: 'typescript',
  themeId: 'tokyo-night',
  showLineNumbers: true,
  highlightedLines: [7, 8, 9, 10, 11],
  diffLines: [],
  focusDimming: false,
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'JetBrains Mono',
  tabSize: 2,
};

export const DEFAULT_SCREENSHOT_CONFIG: ScreenshotConfig = {
  imageUrl: null,
  fileName: null,
  naturalWidth: 0,
  naturalHeight: 0,
  aspectRatio: 16 / 9,
  objectFit: 'contain',
};

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: false,
  handle: '@snapcraft',
  platform: 'github',
  opacity: 0.6,
  position: 'bottom-right',
};

export interface SnapStoreState {
  mode: SnapMode;
  window: WindowConfig;
  background: BackgroundConfig;
  shadow: ShadowConfig;
  transform3D: Transform3DConfig;
  canvas: CanvasConfig;
  code: CodeConfig;
  screenshot: ScreenshotConfig;
  watermark: WatermarkConfig;

  // Annotations
  annotations: AnnotationItem[];
  selectedAnnotationId: string | null;

  // Viewport Stage UI state
  stageZoom: number;
  showGuides: boolean;

  // Export Settings & Pipeline State
  exportScale: ExportScale;
  exportFormat: ExportFormat;
  isExporting: boolean;
  exportStatusMessage: string | null;

  // Presets
  savedPresets: SnapPreset[];

  // Actions
  setMode: (mode: SnapMode) => void;
  updateWindow: (partial: Partial<WindowConfig>) => void;
  setWindowWidth: (width: number | undefined) => void;
  updateBackground: (partial: Partial<BackgroundConfig>) => void;
  updateShadow: (partial: Partial<ShadowConfig>) => void;
  updateTransform3D: (partial: Partial<Transform3DConfig>) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  updateCanvas: (partial: Partial<CanvasConfig>) => void;
  setAspectRatio: (aspectRatio: AspectRatioPreset) => void;
  setAlignment: (alignment: StageAlignment) => void;
  updateCode: (partial: Partial<CodeConfig>) => void;
  updateScreenshot: (partial: Partial<ScreenshotConfig>) => void;
  updateWatermark: (partial: Partial<WatermarkConfig>) => void;

  toggleLineHighlight: (lineNumber: number) => void;
  setDiffLine: (lineNumber: number, type: 'add' | 'remove' | null) => void;
  cycleLineState: (lineNumber: number) => void;

  // Annotations Actions
  addAnnotation: (item: AnnotationItem) => void;
  updateAnnotation: (id: string, partial: Partial<AnnotationItem>) => void;
  selectAnnotation: (id: string | null) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  setAnnotationColor: (id: string, color: string) => void;

  setStageZoom: (zoom: number) => void;
  toggleGuides: () => void;
  applyTemplate: (templateId: string) => void;

  setExportScale: (scale: ExportScale) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportStatus: (isExporting: boolean, message?: string | null) => void;

  savePreset: (name: string) => void;
  applyPreset: (preset: SnapPreset) => void;
  deletePreset: (id: string) => void;
  restoreSampleCode: () => void;

  getShareableUrl: () => string;
  loadStateFromUrl: () => boolean;
  resetAll: () => void;
}

export const useSnapStore = create<SnapStoreState>()(
  persist(
    (set, get) => ({
      mode: 'code',
      window: { ...DEFAULT_WINDOW_CONFIG },
      background: { ...DEFAULT_BACKGROUND_CONFIG },
      shadow: { ...DEFAULT_SHADOW_CONFIG },
      transform3D: { ...DEFAULT_TRANSFORM3D_CONFIG },
      canvas: { ...DEFAULT_CANVAS_CONFIG },
      code: { ...DEFAULT_CODE_CONFIG },
      screenshot: { ...DEFAULT_SCREENSHOT_CONFIG },
      watermark: { ...DEFAULT_WATERMARK_CONFIG },

      annotations: [],
      selectedAnnotationId: null,

      stageZoom: 1,
      showGuides: false,

      exportScale: 2,
      exportFormat: 'png',
      isExporting: false,
      exportStatusMessage: null,
      savedPresets: [],

      setMode: (mode) => set({ mode }),

      updateWindow: (partial) =>
        set((state) => ({ window: { ...state.window, ...partial } })),

      setWindowWidth: (width) =>
        set((state) => ({ window: { ...state.window, width } })),

      updateBackground: (partial) =>
        set((state) => ({ background: { ...state.background, ...partial } })),

      updateShadow: (partial) =>
        set((state) => ({ shadow: { ...state.shadow, ...partial } })),

      updateTransform3D: (partial) =>
        set((state) => ({
          transform3D: { ...state.transform3D, ...partial, cameraPreset: 'custom' },
        })),

      setCameraPreset: (preset) =>
        set((state) => {
          switch (preset) {
            case 'flat':
              return {
                transform3D: {
                  ...state.transform3D,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                  cameraPreset: 'flat',
                },
              };
            case 'iso-left':
              return {
                transform3D: {
                  ...state.transform3D,
                  rotateX: 12,
                  rotateY: -15,
                  rotateZ: 2,
                  cameraPreset: 'iso-left',
                },
              };
            case 'iso-right':
              return {
                transform3D: {
                  ...state.transform3D,
                  rotateX: 12,
                  rotateY: 15,
                  rotateZ: -2,
                  cameraPreset: 'iso-right',
                },
              };
            case 'hero-tilt':
              return {
                transform3D: {
                  ...state.transform3D,
                  rotateX: 16,
                  rotateY: 0,
                  rotateZ: 0,
                  cameraPreset: 'hero-tilt',
                },
              };
            default:
              return {
                transform3D: { ...state.transform3D, cameraPreset: 'custom' },
              };
          }
        }),

      updateCanvas: (partial) =>
        set((state) => ({ canvas: { ...state.canvas, ...partial } })),

      setAspectRatio: (aspectRatio) =>
        set((state) => ({ canvas: { ...state.canvas, aspectRatio } })),

      setAlignment: (alignment) =>
        set((state) => ({ canvas: { ...state.canvas, alignment } })),

      updateCode: (partial) =>
        set((state) => ({ code: { ...state.code, ...partial } })),

      updateScreenshot: (partial) =>
        set((state) => ({ screenshot: { ...state.screenshot, ...partial } })),

      updateWatermark: (partial) =>
        set((state) => ({ watermark: { ...state.watermark, ...partial } })),

      toggleLineHighlight: (lineNumber) =>
        set((state) => {
          const current = state.code.highlightedLines;
          const exists = current.includes(lineNumber);
          const next = exists
            ? current.filter((l) => l !== lineNumber)
            : [...current, lineNumber].sort((a, b) => a - b);
          return { code: { ...state.code, highlightedLines: next } };
        }),

      setDiffLine: (lineNumber, type) =>
        set((state) => {
          const filtered = state.code.diffLines.filter((d) => d.line !== lineNumber);
          if (type) {
            filtered.push({ line: lineNumber, type });
          }
          return {
            code: {
              ...state.code,
              diffLines: filtered.sort((a, b) => a.line - b.line),
            },
          };
        }),

      cycleLineState: (lineNumber) =>
        set((state) => {
          const isHighlighted = state.code.highlightedLines.includes(lineNumber);
          const diffMatch = state.code.diffLines.find((d) => d.line === lineNumber);
          const diffType = diffMatch?.type;

          let newHighlights = [...state.code.highlightedLines];
          let newDiffs = state.code.diffLines.filter((d) => d.line !== lineNumber);

          if (!isHighlighted && !diffType) {
            newHighlights.push(lineNumber);
            newHighlights.sort((a, b) => a - b);
          } else if (isHighlighted && !diffType) {
            newHighlights = newHighlights.filter((l) => l !== lineNumber);
            newDiffs.push({ line: lineNumber, type: 'add' });
          } else if (diffType === 'add') {
            newDiffs.push({ line: lineNumber, type: 'remove' });
          }

          return {
            code: {
              ...state.code,
              highlightedLines: newHighlights,
              diffLines: newDiffs.sort((a, b) => a.line - b.line),
            },
          };
        }),

      // Annotations Actions
      addAnnotation: (item) =>
        set((state) => ({
          annotations: [...state.annotations, item],
          selectedAnnotationId: item.id,
        })),

      updateAnnotation: (id, partial) =>
        set((state) => ({
          annotations: state.annotations.map((a) =>
            a.id === id ? ({ ...a, ...partial } as AnnotationItem) : a
          ),
        })),

      selectAnnotation: (selectedAnnotationId) => set({ selectedAnnotationId }),

      removeAnnotation: (id) =>
        set((state) => ({
          annotations: state.annotations.filter((a) => a.id !== id),
          selectedAnnotationId:
            state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
        })),

      clearAnnotations: () =>
        set({ annotations: [], selectedAnnotationId: null }),

      setAnnotationColor: (id, color) =>
        set((state) => ({
          annotations: state.annotations.map((a) =>
            a.id === id ? { ...a, color } : a
          ),
        })),

      setStageZoom: (stageZoom) => set({ stageZoom }),
      toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

      applyTemplate: (templateId) => {
        const tpl = STUDIO_TEMPLATES.find((t) => t.id === templateId);
        if (!tpl) return;

        const currentCodeLines = get().code.code.split('\n').length;
        const needsSampleCode = currentCodeLines < 7;

        set((state) => ({
          mode: tpl.mode,
          background: {
            ...state.background,
            type: 'gradient',
            gradientId: tpl.gradientId,
            noiseOpacity: tpl.noiseOpacity,
          },
          window: {
            ...state.window,
            frameStyle: tpl.frameStyle,
            glassOpacity: tpl.id === 'minimalist-glass' ? 0.75 : 0.95,
            backdropBlur: tpl.id === 'minimalist-glass' ? 30 : 20,
          },
          shadow: {
            ...state.shadow,
            preset: tpl.shadowPreset,
            coloredGlow: tpl.coloredGlow,
            elevation: tpl.shadowPreset === 'dreamy' ? 80 : 50,
          },
          transform3D: {
            rotateX: tpl.rotateX,
            rotateY: tpl.rotateY,
            rotateZ: tpl.rotateZ,
            perspective: 1200,
            cameraPreset: tpl.cameraPreset,
          },
          canvas: {
            ...state.canvas,
            alignment: tpl.alignment,
          },
          code: {
            ...state.code,
            code: needsSampleCode ? DEFAULT_CODE_SAMPLE : state.code.code,
            themeId: tpl.themeId,
            diffLines:
              tpl.id === 'emerald-diff'
                ? [
                    { line: 7, type: 'remove' },
                    { line: 8, type: 'add' },
                    { line: 9, type: 'add' },
                  ]
                : state.code.diffLines,
          },
        }));
      },

      restoreSampleCode: () =>
        set((state) => ({
          code: {
            ...state.code,
            code: DEFAULT_CODE_SAMPLE,
            diffLines: [],
            highlightedLines: [7, 8, 9, 10, 11],
          },
        })),

      setExportScale: (exportScale) => set({ exportScale }),
      setExportFormat: (exportFormat) => set({ exportFormat }),
      setExportStatus: (isExporting, message = null) =>
        set({ isExporting, exportStatusMessage: message }),

      savePreset: (name) =>
        set((state) => {
          const newPreset: SnapPreset = {
            id: `preset-${Date.now()}`,
            name,
            createdAt: Date.now(),
            state: {
              mode: state.mode,
              window: { ...state.window },
              background: { ...state.background },
              shadow: { ...state.shadow },
              transform3D: { ...state.transform3D },
              canvas: { ...state.canvas },
              code: { ...state.code },
              screenshot: { ...state.screenshot },
              watermark: { ...state.watermark },
              annotations: [...state.annotations],
            },
          };
          return { savedPresets: [newPreset, ...state.savedPresets] };
        }),

      applyPreset: (preset) =>
        set({
          mode: preset.state.mode,
          window: { ...preset.state.window },
          background: { ...preset.state.background },
          shadow: { ...preset.state.shadow },
          transform3D: { ...preset.state.transform3D },
          canvas: { ...preset.state.canvas },
          code: { ...preset.state.code },
          screenshot: { ...preset.state.screenshot },
          watermark: { ...preset.state.watermark },
          annotations: preset.state.annotations ? [...preset.state.annotations] : [],
        }),

      deletePreset: (id) =>
        set((state) => ({
          savedPresets: state.savedPresets.filter((p) => p.id !== id),
        })),

      getShareableUrl: () => {
        const state = get();
        const payload: SnapPreset['state'] = {
          mode: state.mode,
          window: state.window,
          background: state.background,
          shadow: state.shadow,
          transform3D: state.transform3D,
          canvas: state.canvas,
          code: state.code,
          screenshot: state.screenshot,
          watermark: state.watermark,
          annotations: state.annotations,
        };
        const encoded = encodeSnapToUrl(payload);
        const url = new URL(window.location.href);
        url.searchParams.set('snap', encoded);
        return url.toString();
      },

      loadStateFromUrl: () => {
        if (typeof window === 'undefined') return false;
        const search = window.location.search;
        if (!search || !search.includes('snap=')) return false;

        const decoded = decodeSnapFromUrl(search);
        if (decoded) {
          set((state) => ({
            mode: decoded.mode ?? state.mode,
            window: decoded.window ? { ...state.window, ...decoded.window } : state.window,
            background: decoded.background ? { ...state.background, ...decoded.background } : state.background,
            shadow: decoded.shadow ? { ...state.shadow, ...decoded.shadow } : state.shadow,
            transform3D: decoded.transform3D ? { ...state.transform3D, ...decoded.transform3D } : state.transform3D,
            canvas: decoded.canvas ? { ...state.canvas, ...decoded.canvas } : state.canvas,
            code: decoded.code ? { ...state.code, ...decoded.code } : state.code,
            screenshot: decoded.screenshot ? { ...state.screenshot, ...decoded.screenshot } : state.screenshot,
            watermark: decoded.watermark ? { ...state.watermark, ...decoded.watermark } : state.watermark,
            annotations: decoded.annotations ? [...decoded.annotations] : state.annotations,
          }));
          return true;
        }
        return false;
      },

      resetAll: () =>
        set({
          mode: 'code',
          window: { ...DEFAULT_WINDOW_CONFIG },
          background: { ...DEFAULT_BACKGROUND_CONFIG },
          shadow: { ...DEFAULT_SHADOW_CONFIG },
          transform3D: { ...DEFAULT_TRANSFORM3D_CONFIG },
          canvas: { ...DEFAULT_CANVAS_CONFIG },
          code: { ...DEFAULT_CODE_CONFIG },
          screenshot: { ...DEFAULT_SCREENSHOT_CONFIG },
          watermark: { ...DEFAULT_WATERMARK_CONFIG },
          annotations: [],
          selectedAnnotationId: null,
          stageZoom: 1,
          showGuides: false,
        }),
    }),
    {
      name: 'snapcraft-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        window: state.window,
        background: state.background,
        shadow: state.shadow,
        transform3D: state.transform3D,
        canvas: state.canvas,
        code: state.code,
        screenshot: {
          ...state.screenshot,
          imageUrl: state.screenshot.imageUrl?.startsWith('data:') ? null : state.screenshot.imageUrl,
        },
        watermark: state.watermark,
        annotations: state.annotations,
        savedPresets: state.savedPresets,
      }),
    }
  )
);
