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

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

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
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between px-3 sm:px-4 select-none shrink-0 font-sans gap-2">
          {/* Brand & Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Brand */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary shadow-md shadow-primary/20 shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">SnapCraft</span>
                <span className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-medium text-zinc-400">
                  STUDIO
                </span>
              </div>
            </div>

            <div className="h-4 w-[1px] bg-white/[0.08] mx-0.5 hidden sm:block" />

            {/* Mode Switcher (Segmented Control) */}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-950/80 p-1">
              <button
                onClick={() => setMode('code')}
                className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-medium border transition-all whitespace-nowrap ${
                  mode === 'code'
                    ? 'border-white/[0.08] bg-zinc-800/90 text-white shadow-sm'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Code2 className={`h-3.5 w-3.5 shrink-0 ${mode === 'code' ? 'text-brand-indigo-light' : 'text-zinc-500'}`} strokeWidth={1.75} />
                <span>Código</span>
              </button>
              <button
                onClick={() => setMode('screenshot')}
                className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-medium border transition-all whitespace-nowrap ${
                  mode === 'screenshot'
                    ? 'border-white/[0.08] bg-zinc-800/90 text-white shadow-sm'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <ImageIcon className={`h-3.5 w-3.5 shrink-0 ${mode === 'screenshot' ? 'text-brand-purple-light' : 'text-zinc-500'}`} strokeWidth={1.75} />
                <span>Screenshot</span>
              </button>
            </div>

            {/* Quick Command Bar Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden lg:flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 sm:px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
              title="Abrir Comandos (⌘K ou ?)"
            >
              <Command className="h-3.5 w-3.5 text-brand-indigo-light shrink-0" strokeWidth={1.75} />
              <span>Comandos</span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Center: Aspect Ratio Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hidden md:inline ml-1 mr-0.5">
              Proporção
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-950/80 p-1 overflow-x-auto no-scrollbar">
              {ASPECT_RATIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setAspectRatio(preset.id as AspectRatioPreset)}
                  className={`rounded-[6px] px-2 py-1 text-[11px] font-mono border whitespace-nowrap transition-all flex items-center justify-center ${
                    canvas.aspectRatio === preset.id
                      ? 'border-white/[0.08] bg-zinc-800/90 text-white shadow-sm font-medium'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                  title={preset.label}
                >
                  {preset.id}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Primary Studio Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share Preset Link */}
            <button
              onClick={handleCopyLink}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 sm:px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
              title="Compartilhar Link do Preset"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-success shrink-0" strokeWidth={2} />
                  <span className="text-success font-medium hidden sm:inline">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Compartilhar</span>
                </>
              )}
            </button>

            {/* Copy Image ⌘C button (Primary CTA) */}
            <button
              onClick={handleCopyImage}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 sm:px-3.5 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:opacity-95 transition-all active:scale-[0.98]"
            >
              {copiedImage ? (
                <>
                  <Check className="h-4 w-4 text-white shrink-0" strokeWidth={2} />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0 text-white" strokeWidth={1.75} />
                  <span>Copiar Imagem</span>
                  <kbd className="text-[10px] opacity-70 font-mono ml-0.5 hidden sm:inline">⌘C</kbd>
                </>
              )}
            </button>

            {/* Export Button with Scale & Format dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                disabled={isExporting}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 sm:px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-indigo-light shrink-0" />
                ) : (
                  <Download className="h-4 w-4 text-brand-cyan shrink-0" strokeWidth={1.75} />
                )}
                <span>Exportar {exportScale}x</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* Export Menu Dropdown */}
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-[#0D0D10] border border-white/[0.08] rounded-xl shadow-2xl p-2.5 z-50 divide-y divide-white/[0.06] animate-in fade-in zoom-in-95 duration-100">
                  <div className="pb-2">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase px-1 py-1 tracking-wider">
                      Resolução / Densidade
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {([1, 2, 4] as ExportScale[]).map((scale) => (
                        <button
                          key={scale}
                          onClick={() => setExportScale(scale)}
                          className={`h-7 rounded-[6px] text-xs font-mono transition-all flex items-center justify-center border ${
                            exportScale === scale
                              ? 'border-white/[0.08] bg-zinc-800 text-white font-semibold shadow-sm'
                              : 'border-transparent bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {scale === 4 ? '4K (4x)' : `${scale}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase px-1 py-1 tracking-wider">
                      Formato
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {(['png', 'webp', 'svg'] as ExportFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`h-7 rounded-[6px] text-xs uppercase font-mono transition-all flex items-center justify-center border ${
                            exportFormat === fmt
                              ? 'border-white/[0.08] bg-zinc-800 text-white font-semibold shadow-sm'
                              : 'border-transparent bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleExportDownload(exportScale, exportFormat)}
                      className="w-full h-8 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download (⌘S)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-white/[0.08] mx-0.5 hidden sm:block" />

            {/* GitHub Repo */}
            <a
              href="https://github.com/PedroBosa/SnapCraft"
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
              title="Ver no GitHub (Repositório Oficial)"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
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
