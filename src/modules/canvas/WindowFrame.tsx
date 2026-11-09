import React from 'react';
import { Lock, RefreshCw, Minus, Square, X, Terminal as TerminalIcon } from 'lucide-react';
import { WindowFrameStyle } from '../../types/snap';

interface WindowFrameProps {
  style: WindowFrameStyle;
  title: string;
  showTitle: boolean;
  showControls: boolean;
  onTitleChange?: (newTitle: string) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  style,
  title,
  showTitle,
  showControls,
  onTitleChange,
  children,
}) => {
  if (style === 'frameless') {
    return <div className="w-full h-full relative overflow-hidden">{children}</div>;
  }

  const isMac = style === 'macos-dark' || style === 'macos-light' || style === 'macos-mono';
  const isLight = style === 'macos-light';

  return (
    <div className="w-full h-full flex flex-col relative select-text overflow-hidden rounded-[inherit]">
      {/* Titlebar Header */}
      <div
        className={`h-9 px-3.5 flex items-center justify-between border-b text-xs font-medium tracking-tight select-none ${
          isLight
            ? 'bg-white/80 border-black/10 text-neutral-800'
            : 'bg-black/25 border-white/[0.08] text-white/80'
        }`}
      >
        {/* Left Side: macOS Traffic Lights, Terminal Icon, or Windows Fluent Title */}
        <div className="flex items-center gap-2 min-w-[70px]">
          {isMac && showControls && (
            <div className="flex items-center gap-2">
              {style === 'macos-mono' ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-sm" />
                </>
              )}
            </div>
          )}

          {style === 'terminal' && (
            <div className="flex items-center gap-1.5 text-white/50">
              <TerminalIcon className="w-3.5 h-3.5 text-brand-emerald" />
              <span className="text-[11px] font-mono text-white/60">bash</span>
            </div>
          )}

          {style === 'minimal-browser' && (
            <div className="flex items-center gap-1.5 text-white/40">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
          )}

          {style === 'windows-fluent' && (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              className="bg-transparent border-none outline-none text-left text-xs text-white/70 hover:text-white focus:text-white truncate max-w-[220px] font-mono pl-1"
              placeholder="Untitled"
              spellCheck={false}
            />
          )}
        </div>

        {/* Center: Title or Minimal Browser URL bar (Omitted if Windows Fluent to prevent duplication) */}
        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          {style === 'minimal-browser' && showTitle ? (
            <div className="w-full max-w-[340px] h-6 px-2.5 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center gap-2 text-[11px] text-white/60 font-mono">
              <Lock className="w-3 h-3 text-brand-emerald shrink-0" />
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange?.(e.target.value)}
                className="bg-transparent border-none outline-none text-white/80 w-full text-center truncate focus:text-white"
                spellCheck={false}
              />
              <RefreshCw className="w-2.5 h-2.5 text-white/40 shrink-0 hover:text-white/80 cursor-pointer" />
            </div>
          ) : style !== 'windows-fluent' && showTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              className="bg-transparent border-none outline-none text-center text-xs text-white/70 hover:text-white/95 focus:text-white truncate max-w-[260px] font-sans transition-colors"
              placeholder="Untitled"
              spellCheck={false}
            />
          ) : null}
        </div>

        {/* Right Side: Windows Fluent Controls or Spacer */}
        <div className="min-w-[70px] flex items-center justify-end">
          {style === 'windows-fluent' && showControls && (
            <div className="flex items-center gap-2 text-white/50">
              <Minus className="w-3 h-3 hover:text-white cursor-pointer" />
              <Square className="w-2.5 h-2.5 hover:text-white cursor-pointer" />
              <X className="w-3 h-3 hover:text-red-400 cursor-pointer" />
            </div>
          )}
        </div>
      </div>

      {/* Main Window Body Container */}
      <div className="flex-1 relative overflow-hidden">{children}</div>
    </div>
  );
};
