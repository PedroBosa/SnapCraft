import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useSnapStore } from '../../store/useSnapStore';
import { generateLayeredShadow } from '../../core/shadows';
import {
  generateSvgNoiseDataUri,
  getDominantColor,
  resolveBackgroundStyle,
} from '../../core/backgrounds';
import { WindowFrame } from './WindowFrame';
import { CodeEditor } from './CodeEditor';
import { ScreenshotView } from './ScreenshotView';
import { Watermark } from './Watermark';
import { AnnotationLayer, AnnotationToolbar } from './AnnotationLayer';
import { resolveStageDimensions } from '../../core/aspectRatios';
import { StageAlignment } from '../../types/snap';

interface StageViewportProps {
  stageRef: React.RefObject<HTMLDivElement>;
}

export const StageViewport: React.FC<StageViewportProps> = ({ stageRef }) => {
  const {
    mode,
    setMode,
    window: winConfig,
    background: bgConfig,
    shadow: shadowConfig,
    transform3D,
    canvas: canvasConfig,
    code: codeConfig,
    screenshot: screenConfig,
    watermark: waterConfig,
    stageZoom,
    setStageZoom,
    showGuides,
    toggleGuides,
    updateCode,
    updateWindow,
    setWindowWidth,
    updateScreenshot,
    cycleLineState,
    selectAnnotation,
    isExporting,
  } = useSnapStore();

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [isResizing, setIsResizing] = useState(false);
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null);
  const resizeStartRef = useRef<{ startX: number; startWidth: number }>({
    startX: 0,
    startWidth: 640,
  });

  const windowContainerRef = useRef<HTMLDivElement>(null);
  const noiseDataUri = useRef(generateSvgNoiseDataUri(0.7, 3));

  // Measure stage dimensions in real-time
  useEffect(() => {
    if (!stageRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height),
        });
      }
    });

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [stageRef]);

  // Compute dominant color for colored glow
  const dominantColor = getDominantColor(bgConfig);
  const computedShadow = generateLayeredShadow(shadowConfig, dominantColor);
  const resolvedBg = resolveBackgroundStyle(bgConfig);
  const stageAspectRatio = resolveStageDimensions(canvasConfig.aspectRatio);

  // Resolves 9-point flex alignment
  const getAlignmentClasses = (alignment: StageAlignment): string => {
    switch (alignment) {
      case 'top':
        return 'items-start justify-center';
      case 'bottom':
        return 'items-end justify-center';
      case 'left':
        return 'items-center justify-start';
      case 'right':
        return 'items-center justify-end';
      case 'top-left':
        return 'items-start justify-start';
      case 'top-right':
        return 'items-start justify-end';
      case 'bottom-left':
        return 'items-end justify-start';
      case 'bottom-right':
        return 'items-end justify-end';
      case 'center':
      default:
        return 'items-center justify-center';
    }
  };

  // Global image paste handler for automatic mode switching and instant import
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = ev.target?.result as string;
              const img = new Image();
              img.onload = () => {
                setMode('screenshot');
                updateScreenshot({
                  imageUrl: result,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  fileName: file.name,
                });
                updateWindow({ title: file.name });
              };
              img.src = result;
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setMode, updateScreenshot, updateWindow]);

  // Interactive Window Width Drag Handlers
  const handlePointerDownResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, side: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();

      const currentWidth =
        winConfig.width || windowContainerRef.current?.offsetWidth || 640;

      resizeStartRef.current = {
        startX: e.clientX,
        startWidth: currentWidth,
      };

      setIsResizing(true);
      setResizingSide(side);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [winConfig.width]
  );

  const handlePointerMoveResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing || !resizingSide) return;

      const { startX, startWidth } = resizeStartRef.current;
      const zoom = stageZoom || 1;
      const deltaX = (e.clientX - startX) / zoom;

      // Symmetrical horizontal resizing: dragging right expands, dragging left on right shrinks
      const multiplier = resizingSide === 'right' ? 2 : -2;
      const newWidth = Math.min(
        1200,
        Math.max(360, Math.round(startWidth + deltaX * multiplier))
      );

      setWindowWidth(newWidth);
    },
    [isResizing, resizingSide, setWindowWidth, stageZoom]
  );

  const handlePointerUpResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isResizing) {
        setIsResizing(false);
        setResizingSide(null);
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore if already released
        }
      }
    },
    [isResizing]
  );

  return (
    <div className="relative flex-1 h-full w-full overflow-auto bg-studio-bg bg-dot-grid [background-size:20px_20px] flex items-center justify-center p-8 select-none">
      {/* Floating Annotation Toolbar in Top Center of Viewport (Safely decoupled from canvas padding) */}
      <AnnotationToolbar />

      {/* Floating Exporting Progress Toast */}
      {isExporting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-black/90 border border-brand-indigo/50 text-white text-xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 stage-ignore-export">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-indigo-light" />
          <span>Rendering high-density export...</span>
        </div>
      )}

      {/* Central Alignment Crosshair Guides */}
      {showGuides && (
        <div className="absolute inset-0 pointer-events-none z-10 stage-ignore-export">
          {/* Vertical Center Guide */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-brand-cyan/40 -translate-x-1/2" />
          {/* Horizontal Center Guide */}
          <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-brand-cyan/40 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-brand-cyan/50 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-brand-cyan" />
          </div>
        </div>
      )}

      {/* Floating HUD: Zoom, Dimensions & Guides in Bottom-Right */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-lg bg-[#0D0D10]/90 backdrop-blur-md border border-white/[0.08] shadow-2xl text-zinc-300 text-xs font-mono stage-ignore-export">
        {/* Real-time Dimensions */}
        <div className="px-2 py-1 text-[11px] text-zinc-400 border-r border-white/[0.06] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo-light animate-pulse" />
          <span>{dimensions.width} × {dimensions.height} px</span>
        </div>

        {/* Guides Toggle */}
        <button
          onClick={toggleGuides}
          className={`p-1.5 rounded-[6px] transition-colors ${
            showGuides
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'hover:bg-white/[0.08] text-zinc-400 hover:text-white'
          }`}
          title="Toggle Center Alignment Guides"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Controls */}
        <button
          onClick={() => setStageZoom(Math.max(0.5, stageZoom - 0.1))}
          className="p-1.5 rounded-[6px] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="px-1 text-[11px] text-zinc-300 min-w-[36px] text-center font-medium">
          {Math.round(stageZoom * 100)}%
        </span>

        <button
          onClick={() => setStageZoom(Math.min(1.5, stageZoom + 0.1))}
          className="p-1.5 rounded-[6px] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setStageZoom(1)}
          className="p-1.5 rounded-[6px] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          title="Reset Zoom (100%)"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Stage Container Scaled by stageZoom */}
      <div
        style={{
          transform: `scale(${stageZoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
        className="flex items-center justify-center"
      >
        {/* Exportable Stage Canvas Element */}
        <div
          ref={stageRef}
          id="snapcraft-stage"
          onClick={() => selectAnnotation(null)}
          className={`relative transition-all duration-200 flex overflow-hidden ${getAlignmentClasses(
            canvasConfig.alignment
          )} ${resolvedBg.isTransparent ? 'canvas-checkerboard' : ''}`}
          style={{
            paddingLeft: `${canvasConfig.paddingX}px`,
            paddingRight: `${canvasConfig.paddingX}px`,
            paddingTop: `${canvasConfig.paddingY}px`,
            paddingBottom: `${canvasConfig.paddingY}px`,
            background: resolvedBg.background,
            aspectRatio: stageAspectRatio.aspectRatio,
            minWidth: '680px',
            minHeight: '380px',
            maxWidth: '100%',
          }}
        >
          {/* Procedural Film Grain Noise Layer */}
          {bgConfig.noiseOpacity > 0 && !resolvedBg.isTransparent && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay z-10"
              style={{
                backgroundImage: `url("${noiseDataUri.current}")`,
                backgroundRepeat: 'repeat',
                opacity: bgConfig.noiseOpacity,
              }}
            />
          )}

          {/* 3D Perspective Viewport Wrapper */}
          <div
            className="relative"
            style={{
              perspective: `${transform3D.perspective}px`,
              perspectiveOrigin: 'center center',
            }}
          >
            {/* 3D Transformed Card Container (Hosts Shadow & Resize Handles) */}
            <div
              ref={windowContainerRef}
              className="relative z-10 group"
              style={{
                width: winConfig.width ? `${winConfig.width}px` : undefined,
                minWidth: '360px',
                maxWidth: '1200px',
                borderRadius: `${winConfig.borderRadius}px`,
                boxShadow: computedShadow.boxShadow,
                transform: `rotateX(${transform3D.rotateX}deg) rotateY(${transform3D.rotateY}deg) rotateZ(${transform3D.rotateZ}deg) scale(${canvasConfig.scale})`,
                transformStyle: 'preserve-3d',
                transition: isResizing
                  ? 'none'
                  : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
              }}
            >
              {/* Left Resize Handle (Allowed outside without being clipped) */}
              <div
                onPointerDown={(e) => handlePointerDownResize(e, 'left')}
                onPointerMove={handlePointerMoveResize}
                onPointerUp={handlePointerUpResize}
                onDoubleClick={() => setWindowWidth(undefined)}
                className="stage-ignore-export absolute -left-3.5 top-1/2 -translate-y-1/2 w-4 h-14 flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity z-30"
                title="Drag to resize window width (Double-click to reset)"
              >
                <div className="w-1.5 h-8 rounded-full bg-white/40 hover:bg-brand-indigo shadow-technical-sm transition-colors" />
              </div>

              {/* Right Resize Handle (Allowed outside without being clipped) */}
              <div
                onPointerDown={(e) => handlePointerDownResize(e, 'right')}
                onPointerMove={handlePointerMoveResize}
                onPointerUp={handlePointerUpResize}
                onDoubleClick={() => setWindowWidth(undefined)}
                className="stage-ignore-export absolute -right-3.5 top-1/2 -translate-y-1/2 w-4 h-14 flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity z-30"
                title="Drag to resize window width (Double-click to reset)"
              >
                <div className="w-1.5 h-8 rounded-full bg-white/40 hover:bg-brand-indigo shadow-technical-sm transition-colors" />
              </div>

              {/* Clean Masked Window Card (Clips all children, titlebars & code backgrounds to exact border-radius) */}
              <div
                className="w-full relative overflow-hidden"
                style={{
                  borderRadius: `${winConfig.borderRadius}px`,
                  backdropFilter: `blur(${winConfig.backdropBlur}px)`,
                  WebkitBackdropFilter: `blur(${winConfig.backdropBlur}px)`,
                  backgroundColor: `rgba(18, 18, 24, ${winConfig.glassOpacity})`,
                  isolation: 'isolate',
                }}
              >
                <WindowFrame
                  style={winConfig.frameStyle}
                  title={winConfig.title}
                  showTitle={winConfig.showTitle}
                  showControls={winConfig.showControls}
                  onTitleChange={(title) => updateWindow({ title })}
                >
                  {mode === 'code' ? (
                    <CodeEditor
                      config={codeConfig}
                      onChange={(code) => updateCode({ code })}
                      onCycleLineState={cycleLineState}
                    />
                  ) : (
                    <ScreenshotView
                      config={screenConfig}
                      onImageLoaded={(url, naturalWidth, naturalHeight, fileName) =>
                        updateScreenshot({
                          imageUrl: url,
                          naturalWidth,
                          naturalHeight,
                          fileName,
                        })
                      }
                    />
                  )}
                </WindowFrame>
              </div>
            </div>
          </div>

          {/* Interactive Vector Annotation Layer */}
          <AnnotationLayer />

          {/* Watermark Overlay */}
          <Watermark config={waterConfig} />
        </div>
      </div>
    </div>
  );
};
