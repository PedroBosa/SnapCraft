import React, { useState } from 'react';
import {
  Layers,
  Palette,
  Code2,
  Image as ImageIcon,
  Sun,
  Shield,
  Maximize2,
  Sparkles,
  Box,
  Focus,
  LayoutGrid,
  Plus,
  Trash2,
  Check,
  FolderHeart,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useSnapStore } from '../../store/useSnapStore';
import { GRADIENT_PRESETS } from '../../core/backgrounds';
import { SHADOW_PRESETS } from '../../core/shadows';
import { SUPPORTED_LANGUAGES, SYNTAX_THEMES } from '../../core/tokenizer';
import { STUDIO_TEMPLATES } from '../../core/templates';
import {
  BackgroundType,
  CameraPreset,
  StageAlignment,
  SupportedLanguage,
  WindowFrameStyle,
  WatermarkPlatform,
} from '../../types/snap';

const ALIGNMENT_GRID: { id: StageAlignment; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top', label: 'Top' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'bottom-right', label: 'Bottom Right' },
];

export const Sidebar: React.FC = () => {
  const {
    mode,
    background,
    updateBackground,
    window: winConfig,
    updateWindow,
    shadow,
    updateShadow,
    transform3D,
    updateTransform3D,
    setCameraPreset,
    canvas,
    updateCanvas,
    setAlignment,
    code,
    updateCode,
    watermark,
    updateWatermark,
    applyTemplate,
    savedPresets,
    savePreset,
    applyPreset,
    deletePreset,
    restoreSampleCode,
  } = useSnapStore();

  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    templates: true,
    transform: true,
    background: true,
    window: true,
    shadow: false,
    canvas: false,
    code: true,
    watermark: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    savePreset(newPresetName.trim());
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  return (
    <aside className="w-80 h-full border-r border-studio-border bg-studio-panel/90 backdrop-blur-md overflow-y-auto divide-y divide-white/[0.06] text-xs select-none shrink-0 font-sans">
      {/* 1. Studio Templates & User Presets */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
          <button
            onClick={() => toggleSection('templates')}
            className="flex items-center gap-1.5 font-medium text-white/80 hover:text-white transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.templates ? '' : '-rotate-90'
              }`}
            />
            <LayoutGrid className="w-3.5 h-3.5 text-brand-purple-light" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setIsSavingPreset(!isSavingPreset)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] hover:bg-brand-indigo/30 text-white/70 hover:text-brand-indigo-light text-[10px] font-mono border border-white/[0.08] transition-colors"
            title="Save current configuration as custom preset"
          >
            <Plus className="w-3 h-3" />
            <span>Save</span>
          </button>
        </div>

        {openSections.templates && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-100">
            {/* Inline Save Preset Dialog */}
            {isSavingPreset && (
              <div className="p-2.5 rounded-md bg-black/60 border border-brand-indigo/40 space-y-2 animate-in fade-in duration-100 shadow-technical-sm">
                <div className="text-[10px] text-white/70 font-mono">
                  Preset Name:
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePreset();
                      if (e.key === 'Escape') setIsSavingPreset(false);
                    }}
                    placeholder="e.g. Hero Banner"
                    className="flex-1 bg-studio-subtle border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-brand-indigo font-mono placeholder:text-white/30"
                  />
                  <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="px-2.5 py-1 rounded bg-brand-indigo hover:bg-brand-indigo-hover text-white text-xs font-medium disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Clean Studio Template Chips (Anti-AI Slop: No truncated subtitles) */}
            <div className="grid grid-cols-2 gap-1.5">
              {STUDIO_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className="group h-8 px-2.5 rounded-md bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-brand-purple/40 text-left transition-all flex items-center gap-2"
                  title={tpl.description}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                    style={{ background: tpl.previewBg }}
                  />
                  <span className="text-[11px] font-medium text-white/80 group-hover:text-white truncate">
                    {tpl.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Saved User Custom Presets */}
            {savedPresets.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono uppercase tracking-wider">
                  <FolderHeart className="w-3 h-3 text-brand-emerald" />
                  <span>Custom Presets ({savedPresets.length})</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="group flex items-center justify-between h-7 px-2 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                    >
                      <button
                        onClick={() => applyPreset(preset)}
                        className="flex-1 text-left truncate text-white/70 hover:text-white text-[11px] font-medium flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="p-1 text-white/30 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 3D Perspective & Spatial Alignment */}
      <div className="p-3.5 space-y-2.5">
        <button
          onClick={() => toggleSection('transform')}
          className="w-full flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium text-white/80">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.transform ? '' : '-rotate-90'
              }`}
            />
            <Box className="w-3.5 h-3.5 text-brand-indigo-light" />
            <span>3D & Alignment</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {transform3D.cameraPreset}
          </span>
        </button>

        {openSections.transform && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-100">
            {/* Camera Quick Presets */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/40 rounded-md border border-white/[0.06]">
              {(['flat', 'iso-left', 'iso-right', 'hero-tilt'] as CameraPreset[]).map((cam) => (
                <button
                  key={cam}
                  onClick={() => setCameraPreset(cam)}
                  className={`h-6 rounded text-[10px] font-mono transition-all truncate px-1 flex items-center justify-center ${
                    transform3D.cameraPreset === cam
                      ? 'bg-brand-indigo text-white font-semibold shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {cam === 'hero-tilt' ? 'HERO' : cam.replace('iso-', '').toUpperCase()}
                </button>
              ))}
            </div>

            {/* 9-Point Spatial Alignment Grid */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-white/50 text-[10px] font-mono uppercase tracking-wider">
                <span>Canvas Anchor</span>
                <span className="text-white/70">{canvas.alignment}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 w-28 p-1 bg-black/40 rounded-md border border-white/[0.08]">
                {ALIGNMENT_GRID.map((align) => (
                  <button
                    key={align.id}
                    onClick={() => setAlignment(align.id)}
                    className={`h-6 rounded flex items-center justify-center transition-all ${
                      canvas.alignment === align.id
                        ? 'bg-brand-indigo text-white shadow-sm ring-1 ring-white/30'
                        : 'bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title={align.label}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-[1px] ${
                        canvas.alignment === align.id ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Fine-Tuning 3D Sliders */}
            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-white/70 text-[11px]">
                  <span>Rotate X (Tilt)</span>
                  <span className="font-mono text-white/50 text-[10px]">{transform3D.rotateX}°</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={transform3D.rotateX}
                  onChange={(e) => updateTransform3D({ rotateX: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-white/70 text-[11px]">
                  <span>Rotate Y (Yaw)</span>
                  <span className="font-mono text-white/50 text-[10px]">{transform3D.rotateY}°</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={transform3D.rotateY}
                  onChange={(e) => updateTransform3D({ rotateY: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-white/70 text-[11px]">
                  <span>Window Scale</span>
                  <span className="font-mono text-white/50 text-[10px]">{canvas.scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.3"
                  step="0.05"
                  value={canvas.scale}
                  onChange={(e) => updateCanvas({ scale: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Background Section */}
      <div className="p-3.5 space-y-2.5">
        <button
          onClick={() => toggleSection('background')}
          className="w-full flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium text-white/80">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.background ? '' : '-rotate-90'
              }`}
            />
            <Palette className="w-3.5 h-3.5 text-brand-indigo-light" />
            <span>Background</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">{background.type}</span>
        </button>

        {openSections.background && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-100">
            {/* Background Type Switcher */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/40 rounded-md border border-white/[0.06]">
              {(['gradient', 'mesh', 'solid', 'transparent'] as BackgroundType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => updateBackground({ type: t })}
                  className={`h-6 rounded text-[10px] uppercase font-mono transition-all flex items-center justify-center ${
                    background.type === t
                      ? 'bg-brand-indigo text-white font-semibold shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Gradient Presets Catalog */}
            {background.type === 'gradient' && (
              <div className="space-y-1.5">
                <div className="grid grid-cols-5 gap-1.5">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => updateBackground({ gradientId: preset.id })}
                      className={`w-full aspect-square rounded-md transition-all relative border ${
                        background.gradientId === preset.id
                          ? 'border-white scale-105 shadow-technical-glow ring-2 ring-brand-indigo/50'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ background: preset.css }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Solid Color Picker */}
            {background.type === 'solid' && (
              <div className="flex items-center justify-between">
                <span className="text-white/70">Solid Color</span>
                <input
                  type="color"
                  value={background.solidColor}
                  onChange={(e) => updateBackground({ solidColor: e.target.value })}
                  className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
            )}

            {/* Film Grain / Analog Noise Slider */}
            {background.type !== 'transparent' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-white/70 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-purple-light" />
                    Film Grain
                  </span>
                  <span className="font-mono text-white/50 text-[10px]">
                    {Math.round(background.noiseOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.30"
                  step="0.01"
                  value={background.noiseOpacity}
                  onChange={(e) => updateBackground({ noiseOpacity: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-brand-purple"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Window Frame Section */}
      <div className="p-3.5 space-y-2.5">
        <button
          onClick={() => toggleSection('window')}
          className="w-full flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium text-white/80">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.window ? '' : '-rotate-90'
              }`}
            />
            <Layers className="w-3.5 h-3.5 text-brand-purple-light" />
            <span>Frame & Glass</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">{winConfig.frameStyle}</span>
        </button>

        {openSections.window && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-100">
            <div className="space-y-1">
              <label className="text-white/60 text-[11px]">Style</label>
              <select
                value={winConfig.frameStyle}
                onChange={(e) => updateWindow({ frameStyle: e.target.value as WindowFrameStyle })}
                className="w-full h-8 bg-studio-subtle border border-white/10 rounded-md px-2.5 text-white text-xs outline-none focus:border-brand-indigo font-sans"
              >
                <option value="macos-dark">macOS Sequoia (Dark)</option>
                <option value="macos-light">macOS Sequoia (Light)</option>
                <option value="macos-mono">macOS Minimal (Mono)</option>
                <option value="windows-fluent">Windows 11 Fluent</option>
                <option value="minimal-browser">Minimal Browser URL</option>
                <option value="terminal">Terminal Prompt</option>
                <option value="frameless">Frameless Glass Card</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70 text-[11px]">
                <span>Corner Radius</span>
                <span className="font-mono text-white/50 text-[10px]">{winConfig.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={winConfig.borderRadius}
                onChange={(e) => updateWindow({ borderRadius: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70 text-[11px]">
                <span>Glass Opacity</span>
                <span className="font-mono text-white/50 text-[10px]">{Math.round(winConfig.glassOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={winConfig.glassOpacity}
                onChange={(e) => updateWindow({ glassOpacity: parseFloat(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70 text-[11px]">
                <span>Backdrop Blur</span>
                <span className="font-mono text-white/50 text-[10px]">{winConfig.backdropBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={winConfig.backdropBlur}
                onChange={(e) => updateWindow({ backdropBlur: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Window Controls & Title Toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-white/70 text-[11px]">Controls</span>
              <input
                type="checkbox"
                checked={winConfig.showControls}
                onChange={(e) => updateWindow({ showControls: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-studio-subtle accent-brand-indigo cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-[11px]">Title</span>
              <input
                type="checkbox"
                checked={winConfig.showTitle}
                onChange={(e) => updateWindow({ showTitle: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-studio-subtle accent-brand-indigo cursor-pointer"
              />
            </div>

            {winConfig.width && (
              <div className="flex items-center justify-between pt-1 text-[11px] text-white/70 border-t border-white/[0.04]">
                <span>Custom Width</span>
                <div className="flex items-center gap-1.5 font-mono text-white/50 text-[10px]">
                  <span>{winConfig.width}px</span>
                  <button
                    onClick={() => updateWindow({ width: undefined })}
                    className="p-1 text-white/40 hover:text-brand-cyan transition-colors"
                    title="Reset to Auto Width"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Shadow & Lighting Section */}
      <div className="p-3.5 space-y-2.5">
        <button
          onClick={() => toggleSection('shadow')}
          className="w-full flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium text-white/80">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.shadow ? '' : '-rotate-90'
              }`}
            />
            <Sun className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Shadows & Light</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">{shadow.preset}</span>
        </button>

        {openSections.shadow && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-100">
            <div className="grid grid-cols-2 gap-1.5">
              {SHADOW_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() =>
                    updateShadow({
                      preset: preset.id,
                      elevation: preset.elevation,
                      coloredGlow: preset.id === 'colored-glow' ? true : shadow.coloredGlow,
                    })
                  }
                  className={`h-7 px-2.5 rounded text-left text-[11px] font-medium transition-all border ${
                    shadow.preset === preset.id
                      ? 'bg-brand-indigo/20 border-brand-indigo/50 text-white font-semibold'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70 text-[11px]">
                <span>Elevation</span>
                <span className="font-mono text-white/50 text-[10px]">{shadow.elevation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shadow.elevation}
                onChange={(e) => updateShadow({ elevation: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-white/70 text-[11px]">Reactive Colored Glow</span>
              <input
                type="checkbox"
                checked={shadow.coloredGlow}
                onChange={(e) => updateShadow({ coloredGlow: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-studio-subtle accent-brand-indigo cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Canvas Spatial Anatomy */}
      <div className="p-3.5 space-y-2.5">
        <button
          onClick={() => toggleSection('canvas')}
          className="w-full flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium text-white/80">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.canvas ? '' : '-rotate-90'
              }`}
            />
            <Maximize2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Padding & Stage</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {canvas.paddingX}×{canvas.paddingY}
          </span>
        </button>

        {openSections.canvas && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-100">
            <div className="space-y-1">
              <div className="flex justify-between text-white/70 text-[11px]">
                <span>Padding X</span>
                <span className="font-mono text-white/50 text-[10px]">{canvas.paddingX}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="160"
                step="4"
                value={canvas.paddingX}
                onChange={(e) => updateCanvas({ paddingX: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70 text-[11px]">
                <span>Padding Y</span>
                <span className="font-mono text-white/50 text-[10px]">{canvas.paddingY}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="160"
                step="4"
                value={canvas.paddingY}
                onChange={(e) => updateCanvas({ paddingY: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. Code Settings */}
      {mode === 'code' ? (
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
            <button
              onClick={() => toggleSection('code')}
              className="flex items-center gap-1.5 font-medium text-white/80 hover:text-white transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                  openSections.code ? '' : '-rotate-90'
                }`}
              />
              <Code2 className="w-3.5 h-3.5 text-brand-indigo-light" />
              <span>Code & Type</span>
            </button>
            <button
              onClick={restoreSampleCode}
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-brand-cyan transition-colors"
              title="Restore Default Code Sample"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {openSections.code && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-100">
              {/* Focus Dimming Toggle */}
              <div className="flex items-center justify-between p-2 rounded-md bg-brand-purple/10 border border-brand-purple/20">
                <div className="flex items-center gap-1.5">
                  <Focus className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span className="text-white/90 font-medium text-[11px]">Focus Dimming</span>
                </div>
                <input
                  type="checkbox"
                  checked={code.focusDimming}
                  onChange={(e) => updateCode({ focusDimming: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-studio-subtle accent-brand-purple cursor-pointer"
                />
              </div>

              {/* Language Selector */}
              <div className="space-y-1">
                <label className="text-white/60 text-[11px]">Language</label>
                <select
                  value={code.language}
                  onChange={(e) => updateCode({ language: e.target.value as SupportedLanguage })}
                  className="w-full h-8 bg-studio-subtle border border-white/10 rounded-md px-2.5 text-white text-xs outline-none focus:border-brand-indigo font-sans"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1">
                <label className="text-white/60 text-[11px]">Syntax Theme</label>
                <select
                  value={code.themeId}
                  onChange={(e) => updateCode({ themeId: e.target.value })}
                  className="w-full h-8 bg-studio-subtle border border-white/10 rounded-md px-2.5 text-white text-xs outline-none focus:border-brand-indigo font-sans"
                >
                  {SYNTAX_THEMES.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/70 text-[11px]">
                  <span>Font Size</span>
                  <span className="font-mono text-white/50 text-[10px]">{code.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="22"
                  value={code.fontSize}
                  onChange={(e) => updateCode({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Line Numbers Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-white/70 text-[11px]">Line Numbers</span>
                <input
                  type="checkbox"
                  checked={code.showLineNumbers}
                  onChange={(e) => updateCode({ showLineNumbers: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-studio-subtle accent-brand-indigo cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
            <span className="flex items-center gap-1.5 font-medium text-white/80">
              <ImageIcon className="w-3.5 h-3.5 text-brand-purple-light" />
              <span>Screenshot</span>
            </span>
          </div>
          <div className="text-white/60 text-[11px] leading-relaxed">
            Paste images directly with <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white/80 font-mono text-[10px]">⌘V</kbd> or drag and drop.
          </div>
        </div>
      )}

      {/* 8. Customizable Author Watermark */}
      <div className="p-3.5 space-y-2.5">
        <button
          onClick={() => toggleSection('watermark')}
          className="w-full flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium text-white/80">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform text-white/40 ${
                openSections.watermark ? '' : '-rotate-90'
              }`}
            />
            <Shield className="w-3.5 h-3.5 text-brand-indigo-light" />
            <span>Author Handle</span>
          </span>
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={(e) => updateWatermark({ enabled: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-studio-subtle accent-brand-indigo cursor-pointer"
          />
        </button>

        {openSections.watermark && watermark.enabled && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-100">
            <input
              type="text"
              value={watermark.handle}
              onChange={(e) => updateWatermark({ handle: e.target.value })}
              placeholder="@username"
              className="w-full h-8 bg-studio-subtle border border-white/10 rounded-md px-2.5 text-white text-xs outline-none focus:border-brand-indigo font-mono placeholder:text-white/30"
            />

            <div className="grid grid-cols-3 gap-1">
              {(['github', 'x', 'linkedin'] as WatermarkPlatform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => updateWatermark({ platform: p })}
                  className={`h-6 rounded text-[10px] uppercase font-mono transition-all flex items-center justify-center ${
                    watermark.platform === p
                      ? 'bg-brand-indigo/30 border border-brand-indigo text-white font-medium'
                      : 'bg-white/[0.03] text-white/50 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
