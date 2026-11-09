import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Code2,
  Image as ImageIcon,
  Copy,
  Download,
  RotateCcw,
  Box,
  Focus,
  Crosshair,
  Hash,
  ArrowUpRight,
  Bookmark,
  Type,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { useSnapStore } from '../../store/useSnapStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyImage: () => void;
  onDownloadImage: () => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | '3D & Camera' | 'Annotations' | 'View & Toggles';
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onCopyImage,
  onDownloadImage,
}) => {
  const {
    mode,
    setMode,
    setCameraPreset,
    setWindowWidth,
    code,
    updateCode,
    toggleGuides,
    addAnnotation,
    clearAnnotations,
    annotations,
  } = useSnapStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'copy-img',
      category: 'Actions',
      label: 'Copy Image to Clipboard',
      shortcut: '⌘C',
      icon: <Copy className="w-4 h-4 text-brand-indigo-light" />,
      run: () => onCopyImage(),
    },
    {
      id: 'export-png',
      category: 'Actions',
      label: 'Quick Export PNG',
      shortcut: '⌘S',
      icon: <Download className="w-4 h-4 text-brand-cyan" />,
      run: () => onDownloadImage(),
    },
    {
      id: 'toggle-mode',
      category: 'Actions',
      label: mode === 'code' ? 'Switch to Screenshot Mode' : 'Switch to Code Mode',
      shortcut: 'Tab',
      icon: mode === 'code' ? (
        <ImageIcon className="w-4 h-4 text-brand-purple-light" />
      ) : (
        <Code2 className="w-4 h-4 text-brand-indigo-light" />
      ),
      run: () => setMode(mode === 'code' ? 'screenshot' : 'code'),
    },
    {
      id: 'cam-flat',
      category: '3D & Camera',
      label: 'Reset 3D Camera (Flat 0°)',
      icon: <RotateCcw className="w-4 h-4 text-white/50" />,
      run: () => setCameraPreset('flat'),
    },
    {
      id: 'cam-iso-left',
      category: '3D & Camera',
      label: 'Set Isometric Left 3D View',
      icon: <Box className="w-4 h-4 text-brand-indigo-light" />,
      run: () => setCameraPreset('iso-left'),
    },
    {
      id: 'cam-iso-right',
      category: '3D & Camera',
      label: 'Set Isometric Right 3D View',
      icon: <Box className="w-4 h-4 text-brand-purple-light" />,
      run: () => setCameraPreset('iso-right'),
    },
    {
      id: 'cam-hero',
      category: '3D & Camera',
      label: 'Set Top Hero Tilt View',
      icon: <Box className="w-4 h-4 text-brand-emerald" />,
      run: () => setCameraPreset('hero-tilt'),
    },
    {
      id: 'reset-width',
      category: '3D & Camera',
      label: 'Reset Window Width to Auto',
      icon: <RotateCcw className="w-4 h-4 text-white/50" />,
      run: () => setWindowWidth(undefined),
    },
    {
      id: 'add-arrow',
      category: 'Annotations',
      label: 'Add Vector Arrow Annotation',
      icon: <ArrowUpRight className="w-4 h-4 text-brand-indigo-light" />,
      run: () =>
        addAnnotation({
          id: `arrow-${Date.now()}`,
          type: 'arrow',
          color: '#6366F1',
          x1: 80,
          y1: 100,
          x2: 180,
          y2: 60,
          strokeWidth: 3,
        }),
    },
    {
      id: 'add-badge',
      category: 'Annotations',
      label: 'Add Numbered Step Badge',
      icon: <Bookmark className="w-4 h-4 text-brand-purple-light" />,
      run: () =>
        addAnnotation({
          id: `badge-${Date.now()}`,
          type: 'step-badge',
          color: '#9D4EDD',
          x: 90,
          y: 80,
          stepNumber: annotations.filter((a) => a.type === 'step-badge').length + 1,
          size: 28,
        }),
    },
    {
      id: 'add-pill',
      category: 'Annotations',
      label: 'Add Text Pill / Label',
      icon: <Type className="w-4 h-4 text-brand-cyan" />,
      run: () =>
        addAnnotation({
          id: `pill-${Date.now()}`,
          type: 'text-pill',
          color: '#22D3EE',
          x: 100,
          y: 70,
          text: 'Core Logic',
          fontSize: 12,
        }),
    },
    {
      id: 'add-blur',
      category: 'Annotations',
      label: 'Add Redact / Blur Box',
      icon: <EyeOff className="w-4 h-4 text-brand-emerald" />,
      run: () =>
        addAnnotation({
          id: `redact-${Date.now()}`,
          type: 'redact-box',
          color: '#000000',
          x: 120,
          y: 90,
          width: 140,
          height: 32,
        }),
    },
    {
      id: 'clear-anno',
      category: 'Annotations',
      label: 'Clear All Annotations',
      icon: <Trash2 className="w-4 h-4 text-red-400" />,
      run: () => clearAnnotations(),
    },
    {
      id: 'toggle-focus-dim',
      category: 'View & Toggles',
      label: code.focusDimming ? 'Disable Focus Dimming' : 'Enable Focus Dimming',
      icon: <Focus className="w-4 h-4 text-brand-purple-light" />,
      run: () => updateCode({ focusDimming: !code.focusDimming }),
    },
    {
      id: 'toggle-guides',
      category: 'View & Toggles',
      label: 'Toggle Alignment Guides',
      icon: <Crosshair className="w-4 h-4 text-brand-cyan" />,
      run: () => toggleGuides(),
    },
    {
      id: 'toggle-line-nums',
      category: 'View & Toggles',
      label: code.showLineNumbers ? 'Hide Line Numbers' : 'Show Line Numbers',
      icon: <Hash className="w-4 h-4 text-white/50" />,
      run: () => updateCode({ showLineNumbers: !code.showLineNumbers }),
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].run();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] bg-studio-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
      >
        {/* Search Input Bar */}
        <div className="h-12 px-4 border-b border-white/[0.08] flex items-center gap-3 bg-studio-panelAlt">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search action..."
            className="w-full bg-transparent border-none outline-none text-white text-xs font-sans placeholder:text-white/30"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-white/40">
            Esc
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-[320px] overflow-y-auto p-1.5 divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40 font-mono">
              No matching commands found
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.run();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                  selectedIndex === idx
                    ? 'bg-brand-indigo text-white shadow-sm'
                    : 'text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`shrink-0 ${
                      selectedIndex === idx ? 'text-white' : ''
                    }`}
                  >
                    {cmd.icon}
                  </div>
                  <span className="font-medium tracking-tight">{cmd.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider ${
                      selectedIndex === idx ? 'text-white/80' : 'text-white/30'
                    }`}
                  >
                    {cmd.category}
                  </span>
                  {cmd.shortcut && (
                    <kbd
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        selectedIndex === idx
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-white/[0.06] border-white/10 text-white/50'
                      }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="h-8 px-4 border-t border-white/[0.06] bg-black/30 flex items-center justify-between text-[10px] font-mono text-white/40">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>SnapCraft Command Bar</span>
        </div>
      </div>
    </div>
  );
};
