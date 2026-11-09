import React, { useState, useCallback } from 'react';
import {
  Code2,
  Image as ImageIcon,
  Share2,
  Copy,
  Download,
  Check,
  ChevronDown,
  Sparkles,
  Loader2,
  Command,
} from 'lucide-react';
import { useSnapStore } from '../../store/useSnapStore';
import { ASPECT_RATIO_PRESETS } from '../../core/aspectRatios';
import { AspectRatioPreset, ExportFormat, ExportScale } from '../../types/snap';
import { copyStageToClipboard, downloadStageExport } from '../../core/exporter';
import { useGlobalShortcuts } from '../../core/shortcuts';
import { CommandPalette } from './CommandPalette';

interface TopbarProps {
  stageRef: React.RefObject<HTMLDivElement>;
}

export const Topbar: React.FC<TopbarProps> = ({ stageRef }) => {
  const {
    mode,
    setMode,
    canvas,
    setAspectRatio,
    exportScale,
    setExportScale,
    exportFormat,
    setExportFormat,
    getShareableUrl,
    selectedAnnotationId,
    removeAnnotation,
  } = useSnapStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyImage = useCallback(async () => {
    if (!stageRef.current || copiedImage) return;
    try {
      setCopiedImage(true);
      await copyStageToClipboard(stageRef.current, exportScale);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      setCopiedImage(false);
    }
  }, [stageRef, copiedImage, exportScale]);

  const handleExportDownload = useCallback(
    async (scale: ExportScale, format: ExportFormat) => {
      if (!stageRef.current || isExporting) return;
      try {
        setIsExporting(true);
        setIsExportMenuOpen(false);
        await downloadStageExport(stageRef.current, { scale, format });
      } catch (err) {
        console.error('Export failed:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [stageRef, isExporting]
  );

  useGlobalShortcuts({
    onCopyImage: handleCopyImage,
    onDownload: () => handleExportDownload(exportScale, exportFormat),
    onOpenCommandBar: () => setIsCommandPaletteOpen((prev) => !prev),
    onDeleteAnnotation: () => {
      if (selectedAnnotationId) {
        removeAnnotation(selectedAnnotationId);
      }
    },
  });

  return (
    <>
      <header className="h-12 border-b border-studio-border bg-studio-panel/95 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 shrink-0 font-sans">
        {/* Brand & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-studio-border">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-white shadow-technical-sm">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold tracking-tight text-white/90">
              SnapCraft
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/50 border border-white/[0.06]">
              v0.1
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-md border border-white/[0.08] h-8">
            <button
              onClick={() => setMode('code')}
              className={`flex items-center gap-1.5 px-2.5 h-full rounded text-xs font-medium transition-all ${
                mode === 'code'
                  ? 'bg-studio-subtle text-white shadow-sm border border-white/10'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-brand-indigo-light" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setMode('screenshot')}
              className={`flex items-center gap-1.5 px-2.5 h-full rounded text-xs font-medium transition-all ${
                mode === 'screenshot'
                  ? 'bg-studio-subtle text-white shadow-sm border border-white/10'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-brand-purple-light" />
              <span>Screenshot</span>
            </button>
          </div>

          {/* Quick Command Bar Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11px] text-white/50 hover:text-white/90 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] transition-colors"
            title="Open Command Bar (⌘K or ?)"
          >
            <Command className="w-3 h-3 text-brand-indigo-light" />
            <span>Commands</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/[0.06] text-white/40 border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center: Aspect Ratio Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            Ratio
          </span>
          <div className="flex items-center bg-black/40 p-0.5 rounded-md border border-white/[0.08] h-8">
            {ASPECT_RATIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setAspectRatio(preset.id as AspectRatioPreset)}
                className={`px-2.5 h-full rounded text-[11px] font-mono transition-all flex items-center justify-center ${
                  canvas.aspectRatio === preset.id
                    ? 'bg-brand-indigo/25 text-brand-indigo-light border border-brand-indigo/40 font-medium'
                    : 'text-white/50 hover:text-white/80'
                }`}
                title={preset.label}
              >
                {preset.id}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Primary Studio Actions */}
        <div className="flex items-center gap-2">
          {/* Share Preset Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
            title="Share Preset Link via URL"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand-emerald" />
                <span className="text-brand-emerald">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Copy Image ⌘C button */}
          <button
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-md text-xs font-medium text-white bg-brand-indigo hover:bg-brand-indigo-hover shadow-technical-sm transition-all active:scale-[0.98]"
          >
            {copiedImage ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Image</span>
                <kbd className="text-[10px] opacity-70 font-mono ml-0.5">⌘C</kbd>
              </>
            )}
          </button>

          {/* Export Button with Scale & Format dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={isExporting}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-white bg-studio-subtle hover:bg-studio-panelAlt border border-white/10 shadow-technical-sm transition-all"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-indigo-light" />
              ) : (
                <Download className="w-3.5 h-3.5 text-brand-cyan" />
              )}
              <span>Export {exportScale}x</span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>

            {/* Export Menu Dropdown */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-studio-panel border border-white/10 rounded-lg shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-mono text-white/40 uppercase px-2 py-1 tracking-wider">
                  Scale / Density
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {([1, 2, 4] as ExportScale[]).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setExportScale(scale)}
                      className={`h-7 rounded text-xs font-mono transition-all flex items-center justify-center ${
                        exportScale === scale
                          ? 'bg-brand-indigo text-white font-semibold'
                          : 'bg-white/[0.04] text-white/60 hover:text-white'
                      }`}
                    >
                      {scale === 4 ? '4K (4x)' : `${scale}x`}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-white/40 uppercase px-2 py-1 tracking-wider">
                  Format
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {(['png', 'webp', 'svg'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`h-7 rounded text-xs uppercase font-mono transition-all flex items-center justify-center ${
                        exportFormat === fmt
                          ? 'bg-brand-purple text-white font-semibold'
                          : 'bg-white/[0.04] text-white/60 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={() => handleExportDownload(exportScale, exportFormat)}
                    className="w-full h-8 rounded-md bg-white/[0.06] hover:bg-brand-indigo text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (⌘S)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Shortcuts & Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCopyImage={handleCopyImage}
        onDownloadImage={() => handleExportDownload(exportScale, exportFormat)}
      />
    </>
  );
};
