export type SnapMode = 'code' | 'screenshot';

export type WindowFrameStyle =
  | 'macos-dark'
  | 'macos-light'
  | 'macos-mono'
  | 'windows-fluent'
  | 'minimal-browser'
  | 'terminal'
  | 'frameless';

export type AspectRatioPreset =
  | 'auto'
  | '16:9'
  | '4:3'
  | '1:1'
  | 'x-post'       // 1200 x 675
  | 'og-image';     // 1200 x 630

export interface AspectRatioDimension {
  id: AspectRatioPreset;
  label: string;
  width?: number;
  height?: number;
  ratio?: number;
}

export type ShadowPreset =
  | 'none'
  | 'subtle'
  | 'elevated'
  | 'dreamy'
  | 'colored-glow'
  | 'custom';

export type BackgroundType = 'gradient' | 'mesh' | 'solid' | 'transparent';

export interface GradientPreset {
  id: string;
  name: string;
  css: string;
  dominantColor: string;
  tags: ('indigo' | 'purple' | 'cyan' | 'emerald' | 'dark')[];
}

export interface BackgroundConfig {
  type: BackgroundType;
  gradientId: string;
  customGradient?: string;
  solidColor: string;
  noiseOpacity: number; // 0.00 to 0.30
  meshColors: [string, string, string, string];
  angle: number;
}

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'go'
  | 'sql'
  | 'html'
  | 'css'
  | 'json'
  | 'bash';

export interface SyntaxTheme {
  id: string;
  name: string;
  bg: string;
  fg: string;
  selection: string;
  comment: string;
  keyword: string;
  string: string;
  function: string;
  number: string;
  punctuation: string;
  operator: string;
  classType: string;
  variable: string;
  tag: string;
  attr: string;
}

export interface DiffLine {
  line: number;
  type: 'add' | 'remove';
}

export interface CodeConfig {
  code: string;
  language: SupportedLanguage;
  themeId: string;
  showLineNumbers: boolean;
  highlightedLines: number[];
  diffLines: DiffLine[];
  focusDimming: boolean;  // When true, non-highlighted/diff lines get opacity-40 and subtle blur
  fontSize: number;       // 12 to 24
  lineHeight: number;     // 1.2 to 2.2
  fontFamily: string;
  tabSize: number;
}

export interface ScreenshotConfig {
  imageUrl: string | null;
  fileName: string | null;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
  objectFit: 'contain' | 'cover';
}

export type WatermarkPlatform = 'github' | 'x' | 'linkedin' | 'custom';

export interface WatermarkConfig {
  enabled: boolean;
  handle: string;
  platform: WatermarkPlatform;
  opacity: number; // 0.1 to 1.0
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface WindowConfig {
  frameStyle: WindowFrameStyle;
  title: string;
  showTitle: boolean;
  showControls: boolean;
  borderRadius: number;    // 0 to 32px
  glassOpacity: number;    // 0.4 to 1.0
  backdropBlur: number;    // 0 to 40px
  insetBorder: boolean;
  width?: number;          // 360 to 1200 px, or undefined for auto/fit
}

export interface ShadowConfig {
  preset: ShadowPreset;
  elevation: number;       // 0 to 100
  lightAngle: number;      // 0 to 360 degrees
  coloredGlow: boolean;
  glowColor?: string;
  glowIntensity: number;   // 0 to 1
}

export type StageAlignment =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type CameraPreset = 'flat' | 'iso-left' | 'iso-right' | 'hero-tilt' | 'custom';

export interface Transform3DConfig {
  rotateX: number;       // -20 to 20 deg
  rotateY: number;       // -20 to 20 deg
  rotateZ: number;       // -10 to 10 deg
  perspective: number;   // 800 to 2000 px
  cameraPreset: CameraPreset;
}

export interface CanvasConfig {
  paddingX: number;        // 16 to 160px
  paddingY: number;        // 16 to 160px
  aspectRatio: AspectRatioPreset;
  scale: number;           // 0.5 to 1.5
  alignment: StageAlignment;
}

export type ExportFormat = 'png' | 'webp' | 'svg';
export type ExportScale = 1 | 2 | 4;

export interface StudioTemplate {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  mode: SnapMode;
  gradientId: string;
  themeId: string;
  frameStyle: WindowFrameStyle;
  shadowPreset: ShadowPreset;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  cameraPreset: CameraPreset;
  alignment: StageAlignment;
  coloredGlow: boolean;
  noiseOpacity: number;
}

// Annotation Domain Models
export type AnnotationType = 'arrow' | 'step-badge' | 'text-pill' | 'redact-box';

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  color: string;
}

export interface ArrowAnnotation extends BaseAnnotation {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
}

export interface StepBadgeAnnotation extends BaseAnnotation {
  type: 'step-badge';
  x: number;
  y: number;
  stepNumber: number;
  size: number;
}

export interface TextPillAnnotation extends BaseAnnotation {
  type: 'text-pill';
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export interface RedactBoxAnnotation extends BaseAnnotation {
  type: 'redact-box';
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnnotationItem =
  | ArrowAnnotation
  | StepBadgeAnnotation
  | TextPillAnnotation
  | RedactBoxAnnotation;

export interface SnapPreset {
  id: string;
  name: string;
  createdAt: number;
  state: {
    mode: SnapMode;
    window: WindowConfig;
    background: BackgroundConfig;
    shadow: ShadowConfig;
    canvas: CanvasConfig;
    transform3D: Transform3DConfig;
    code: CodeConfig;
    screenshot: ScreenshotConfig;
    watermark: WatermarkConfig;
    annotations?: AnnotationItem[];
  };
}
