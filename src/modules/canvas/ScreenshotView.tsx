import React, { useCallback, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { ScreenshotConfig } from '../../types/snap';

interface ScreenshotViewProps {
  config: ScreenshotConfig;
  onImageLoaded: (url: string, naturalWidth: number, naturalHeight: number, fileName?: string) => void;
}

export const ScreenshotView: React.FC<ScreenshotViewProps> = ({
  config,
  onImageLoaded,
}) => {
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onImageLoaded(result, img.naturalWidth, img.naturalHeight, file.name);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    },
    [onImageLoaded]
  );

  // Global Ctrl+V / Cmd+V paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  if (!config.imageUrl) {
    return (
      <label
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full min-h-[360px] flex flex-col items-center justify-center p-8 bg-black/40 border-2 border-dashed border-white/10 hover:border-brand-indigo/50 hover:bg-black/60 transition-all cursor-pointer group"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 group-hover:text-brand-indigo-light group-hover:border-brand-indigo/40 transition-colors mb-4">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="text-sm font-medium text-white/90 mb-1">
          Drop screenshot here or click to browse
        </div>
        <div className="text-xs text-white/40 flex items-center gap-2">
          <span>Or press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400 font-mono text-[9px]">
            ⌘V / Ctrl+V
          </kbd>
          <span>to paste from clipboard</span>
        </div>
      </label>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/20">
      <img
        src={config.imageUrl}
        alt={config.fileName || 'Screenshot'}
        className="w-full h-auto max-h-[85vh] object-contain block"
      />
    </div>
  );
};
