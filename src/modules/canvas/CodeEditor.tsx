import React, { useMemo, useRef } from 'react';
import { CodeConfig } from '../../types/snap';
import { getTheme, tokenizeCodeToLines } from '../../core/tokenizer';

interface CodeEditorProps {
  config: CodeConfig;
  onChange: (newCode: string) => void;
  onCycleLineState?: (lineNumber: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  config,
  onChange,
  onCycleLineState,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = useMemo(() => getTheme(config.themeId), [config.themeId]);

  const tokenizedLines = useMemo(() => {
    return tokenizeCodeToLines(
      config.code,
      config.language,
      config.themeId,
      config.highlightedLines,
      config.diffLines
    );
  }, [config.code, config.language, config.themeId, config.highlightedLines, config.diffLines]);

  // Check if any line has an active highlight or diff state for Focus Dimming
  const hasActiveMarks = useMemo(() => {
    return tokenizedLines.some((l) => l.isHighlighted || !!l.diffType);
  }, [tokenizedLines]);

  // Intercept Tab key for code indentation instead of losing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(config.tabSize || 2);
      const nextCode = config.code.substring(0, start) + spaces + config.code.substring(end);
      onChange(nextCode);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
        }
      });
    }
  };

  const isEmpty = config.code.trim().length === 0;

  return (
    <div
      className="relative w-full overflow-hidden text-left font-code rounded-[inherit]"
      style={{
        backgroundColor: theme.bg,
        color: theme.fg,
        fontSize: `${config.fontSize}px`,
        lineHeight: config.lineHeight,
        minHeight: '200px', // Prevent window collapse on empty/short code
      }}
    >
      <div className="flex relative min-h-[200px]">
        {/* Interactive Line Numbers Gutter */}
        {config.showLineNumbers && (
          <div
            className="shrink-0 select-none py-4 pl-3 pr-2.5 text-right border-r border-white/[0.06] text-white/30 text-xs font-mono z-10"
            style={{
              lineHeight: config.lineHeight,
            }}
          >
            {tokenizedLines.map((line) => {
              const isDiffAdd = line.diffType === 'add';
              const isDiffRemove = line.diffType === 'remove';

              let gutterColor = 'text-white/30 hover:text-white/80';
              let badge = null;

              if (line.isHighlighted) {
                gutterColor = 'text-brand-indigo-light font-bold';
                badge = <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo-light animate-pulse" />;
              } else if (isDiffAdd) {
                gutterColor = 'text-[#58DB91] font-bold';
                badge = <span className="text-[#58DB91] text-[10px] font-bold">+</span>;
              } else if (isDiffRemove) {
                gutterColor = 'text-[#F43F5E] font-bold';
                badge = <span className="text-[#F43F5E] text-[10px] font-bold">-</span>;
              }

              return (
                <button
                  type="button"
                  key={line.lineNumber}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCycleLineState?.(line.lineNumber);
                  }}
                  className={`w-full flex items-center justify-end gap-1.5 cursor-pointer px-1 rounded hover:bg-white/[0.08] transition-all group ${gutterColor}`}
                  style={{
                    height: `${config.fontSize * config.lineHeight}px`,
                  }}
                  title={`Line ${line.lineNumber}: Click to cycle (Normal → Highlight → Add (+) → Remove (-) → Normal)`}
                >
                  {badge}
                  <span>{line.lineNumber}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Code Content Area (Visual Syntax Highlights + Diff Highlights + Focus Dimming) */}
        <div className="relative flex-1 overflow-x-auto py-4 min-h-[200px]">
          <div className="relative min-w-full w-max">
            {isEmpty ? (
              <div
                className="px-4 select-none opacity-40 italic"
                style={{
                  color: theme.comment,
                  height: `${config.fontSize * config.lineHeight}px`,
                }}
              >
                // Type or paste your code snippet here...
              </div>
            ) : (
              <div className="min-w-full inline-block">
                {tokenizedLines.map((line) => {
                  const isDiffAdd = line.diffType === 'add';
                  const isDiffRemove = line.diffType === 'remove';
                  const isMarked = line.isHighlighted || isDiffAdd || isDiffRemove;

                  // Background tint calculation
                  let bgClass = '';
                  if (line.isHighlighted) {
                    bgClass = 'bg-brand-indigo/15 border-l-2 border-brand-indigo shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]';
                  } else if (isDiffAdd) {
                    bgClass = 'bg-[#58DB91]/15 border-l-2 border-[#58DB91]';
                  } else if (isDiffRemove) {
                    bgClass = 'bg-[#F43F5E]/15 border-l-2 border-[#F43F5E]';
                  }

                  // Focus Dimming calculation
                  const shouldDim = config.focusDimming && hasActiveMarks && !isMarked;
                  const dimStyle: React.CSSProperties = shouldDim
                    ? { opacity: 0.35, filter: 'blur(0.3px)' }
                    : { opacity: 1, filter: 'none' };

                  return (
                    <div
                      key={line.lineNumber}
                      className={`px-4 whitespace-pre transition-all duration-200 hover:!opacity-100 hover:!filter-none ${bgClass}`}
                      style={{
                        height: `${config.fontSize * config.lineHeight}px`,
                        ...dimStyle,
                      }}
                    >
                      {line.tokens.length === 0 ? (
                        <span> </span>
                      ) : (
                        line.tokens.map((token, idx) => (
                          <span
                            key={idx}
                            style={{
                              color: token.color,
                              fontStyle: token.fontStyle,
                            }}
                          >
                            {token.content}
                          </span>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Transparent Input Textarea Overlay for Direct Typing */}
            <textarea
              ref={textareaRef}
              value={config.code}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="// Type or paste your code snippet here..."
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-brand-indigo-light outline-none resize-none px-4 py-0 whitespace-pre overflow-hidden font-code placeholder:text-transparent"
              style={{
                fontSize: `${config.fontSize}px`,
                lineHeight: config.lineHeight,
                tabSize: config.tabSize,
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* Language badge bottom-right */}
      <div className="absolute bottom-2.5 right-3 pointer-events-none transition-opacity">
        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-white/[0.06] text-white/60 border border-white/[0.08] shadow-sm">
          {config.language}
        </span>
      </div>
    </div>
  );
};
