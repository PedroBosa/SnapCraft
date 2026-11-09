import React, { useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Type,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { useSnapStore } from '../../store/useSnapStore';
import {
  AnnotationItem,
  ArrowAnnotation,
  StepBadgeAnnotation,
  TextPillAnnotation,
  RedactBoxAnnotation,
} from '../../types/snap';

const ANNOTATION_COLORS = [
  '#4F46E5', // Indigo
  '#9D4EDD', // Purple
  '#58DB91', // Emerald
  '#22D3EE', // Cyan
  '#F43F5E', // Rose / Red
];

/**
 * Floating Annotation Toolbar placed at the top of the Viewport.
 * Kept outside #snapcraft-stage to prevent any collision with the rendered window.
 */
export const AnnotationToolbar: React.FC = () => {
  const {
    annotations,
    selectedAnnotationId,
    addAnnotation,
    removeAnnotation,
    clearAnnotations,
    setAnnotationColor,
  } = useSnapStore();

  const handleAddArrow = () => {
    const id = `arrow-${Date.now()}`;
    const newArrow: ArrowAnnotation = {
      id,
      type: 'arrow',
      color: '#6366F1',
      x1: 60,
      y1: 120,
      x2: 180,
      y2: 70,
      strokeWidth: 3,
    };
    addAnnotation(newArrow);
  };

  const handleAddStepBadge = () => {
    const stepCount =
      annotations.filter((a) => a.type === 'step-badge').length + 1;
    const id = `badge-${Date.now()}`;
    const newBadge: StepBadgeAnnotation = {
      id,
      type: 'step-badge',
      color: '#9D4EDD',
      x: 80,
      y: 80,
      stepNumber: stepCount,
      size: 28,
    };
    addAnnotation(newBadge);
  };

  const handleAddTextPill = () => {
    const id = `pill-${Date.now()}`;
    const newPill: TextPillAnnotation = {
      id,
      type: 'text-pill',
      color: '#22D3EE',
      x: 100,
      y: 60,
      text: 'Note: Fast Path',
      fontSize: 12,
    };
    addAnnotation(newPill);
  };

  const handleAddRedactBox = () => {
    const id = `redact-${Date.now()}`;
    const newRedact: RedactBoxAnnotation = {
      id,
      type: 'redact-box',
      color: '#000000',
      x: 120,
      y: 90,
      width: 140,
      height: 32,
    };
    addAnnotation(newRedact);
  };

  const selectedAnno = annotations.find((a) => a.id === selectedAnnotationId);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl text-xs select-none stage-ignore-export">
      {/* Quick Add Buttons */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-white/10">
        <button
          onClick={handleAddArrow}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Add Arrow"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-brand-indigo-light" />
          <span className="text-[11px] font-medium">Arrow</span>
        </button>

        <button
          onClick={handleAddStepBadge}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Add Numbered Step Badge"
        >
          <Bookmark className="w-3.5 h-3.5 text-brand-purple-light" />
          <span className="text-[11px] font-medium">Badge</span>
        </button>

        <button
          onClick={handleAddTextPill}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Add Text Pill / Label"
        >
          <Type className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="text-[11px] font-medium">Text</span>
        </button>

        <button
          onClick={handleAddRedactBox}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Add Blur / Redact Box"
        >
          <EyeOff className="w-3.5 h-3.5 text-brand-emerald" />
          <span className="text-[11px] font-medium">Blur</span>
        </button>
      </div>

      {/* Selected Annotation Actions: Color palette & Delete */}
      {selectedAnno && (
        <div className="flex items-center gap-1.5 pl-0.5 pr-1.5 border-r border-white/10">
          <div className="flex items-center gap-1">
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAnnotationColor(selectedAnno.id, c)}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  selectedAnno.color === c
                    ? 'scale-125 ring-2 ring-white shadow-sm'
                    : 'hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
                title="Change Color"
              />
            ))}
          </div>

          <button
            onClick={() => removeAnnotation(selectedAnno.id)}
            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors ml-1"
            title="Delete Selected Annotation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Clear All Annotations */}
      {annotations.length > 0 && (
        <button
          onClick={clearAnnotations}
          className="px-2 py-1 rounded text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors text-[11px] font-mono"
          title="Clear all annotations"
        >
          Clear ({annotations.length})
        </button>
      )}
    </div>
  );
};

/**
 * Pure Vector & DOM Elements Overlay mounted inside #snapcraft-stage.
 */
export const AnnotationLayer: React.FC = () => {
  const {
    annotations,
    selectedAnnotationId,
    updateAnnotation,
    selectAnnotation,
    stageZoom,
  } = useSnapStore();

  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Dragging state tracking
  const dragRef = useRef<{
    id: string;
    targetPart: 'body' | 'start' | 'end' | 'resize';
    startX: number;
    startY: number;
    initialData: Partial<AnnotationItem>;
  } | null>(null);

  // Pointer drag start
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    targetPart: 'body' | 'start' | 'end' | 'resize'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    selectAnnotation(id);

    const targetAnno = annotations.find((a) => a.id === id);
    if (!targetAnno) return;

    dragRef.current = {
      id,
      targetPart,
      startX: e.clientX,
      startY: e.clientY,
      initialData: { ...targetAnno },
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer drag move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;

    const { id, targetPart, startX, startY, initialData } = dragRef.current;
    const zoom = stageZoom || 1;
    const deltaX = (e.clientX - startX) / zoom;
    const deltaY = (e.clientY - startY) / zoom;

    if (initialData.type === 'arrow') {
      const arrow = initialData as ArrowAnnotation;
      if (targetPart === 'start') {
        updateAnnotation(id, {
          x1: Math.round(arrow.x1 + deltaX),
          y1: Math.round(arrow.y1 + deltaY),
        });
      } else if (targetPart === 'end') {
        updateAnnotation(id, {
          x2: Math.round(arrow.x2 + deltaX),
          y2: Math.round(arrow.y2 + deltaY),
        });
      } else {
        updateAnnotation(id, {
          x1: Math.round(arrow.x1 + deltaX),
          y1: Math.round(arrow.y1 + deltaY),
          x2: Math.round(arrow.x2 + deltaX),
          y2: Math.round(arrow.y2 + deltaY),
        });
      }
    } else if (initialData.type === 'step-badge') {
      const badge = initialData as StepBadgeAnnotation;
      updateAnnotation(id, {
        x: Math.round(badge.x + deltaX),
        y: Math.round(badge.y + deltaY),
      });
    } else if (initialData.type === 'text-pill') {
      const pill = initialData as TextPillAnnotation;
      updateAnnotation(id, {
        x: Math.round(pill.x + deltaX),
        y: Math.round(pill.y + deltaY),
      });
    } else if (initialData.type === 'redact-box') {
      const redact = initialData as RedactBoxAnnotation;
      if (targetPart === 'resize') {
        updateAnnotation(id, {
          width: Math.max(30, Math.round(redact.width + deltaX)),
          height: Math.max(16, Math.round(redact.height + deltaY)),
        });
      } else {
        updateAnnotation(id, {
          x: Math.round(redact.x + deltaX),
          y: Math.round(redact.y + deltaY),
        });
      }
    }
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
      dragRef.current = null;
    }
  };

  return (
    <>
      {/* SVG Canvas for Vector Arrows */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        <defs>
          {annotations
            .filter((a): a is ArrowAnnotation => a.type === 'arrow')
            .map((arrow) => (
              <marker
                key={`marker-${arrow.id}`}
                id={`arrowhead-${arrow.id}`}
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill={arrow.color} />
              </marker>
            ))}
        </defs>

        {annotations
          .filter((a): a is ArrowAnnotation => a.type === 'arrow')
          .map((arrow) => {
            const isSelected = arrow.id === selectedAnnotationId;
            return (
              <g key={arrow.id}>
                {/* Clickable transparent hit area */}
                <line
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke="transparent"
                  strokeWidth={arrow.strokeWidth + 14}
                  className="pointer-events-auto cursor-move"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAnnotation(arrow.id);
                  }}
                  onPointerDown={(e) => handlePointerDown(e, arrow.id, 'body')}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                />

                {/* Visible Arrow Line */}
                <line
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke={arrow.color}
                  strokeWidth={arrow.strokeWidth}
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead-${arrow.id})`}
                  className="pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                />

                {/* Selected Handles (Start & End) - Filtered out on Export */}
                {isSelected && (
                  <>
                    <circle
                      cx={arrow.x1}
                      cy={arrow.y1}
                      r={6}
                      fill="#FFFFFF"
                      stroke={arrow.color}
                      strokeWidth={2}
                      className="stage-ignore-export pointer-events-auto cursor-crosshair shadow-lg"
                      onPointerDown={(e) => handlePointerDown(e, arrow.id, 'start')}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    />
                    <circle
                      cx={arrow.x2}
                      cy={arrow.y2}
                      r={6}
                      fill="#FFFFFF"
                      stroke={arrow.color}
                      strokeWidth={2}
                      className="stage-ignore-export pointer-events-auto cursor-crosshair shadow-lg"
                      onPointerDown={(e) => handlePointerDown(e, arrow.id, 'end')}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    />
                  </>
                )}
              </g>
            );
          })}
      </svg>

      {/* HTML Elements Layer (Badges, Pills, Redact Boxes) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {annotations.map((anno) => {
          const isSelected = anno.id === selectedAnnotationId;

          // 1. Step Badge
          if (anno.type === 'step-badge') {
            const badge = anno as StepBadgeAnnotation;
            return (
              <div
                key={badge.id}
                onPointerDown={(e) => handlePointerDown(e, badge.id, 'body')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => {
                  e.stopPropagation();
                  selectAnnotation(badge.id);
                }}
                className={`absolute pointer-events-auto cursor-move select-none rounded-full flex items-center justify-center font-mono font-bold text-white shadow-xl transition-transform active:scale-95 ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                }`}
                style={{
                  left: `${badge.x}px`,
                  top: `${badge.y}px`,
                  width: `${badge.size}px`,
                  height: `${badge.size}px`,
                  backgroundColor: badge.color,
                  fontSize: `${Math.round(badge.size * 0.46)}px`,
                }}
              >
                {badge.stepNumber}
              </div>
            );
          }

          // 2. Text Pill / Label
          if (anno.type === 'text-pill') {
            const pill = anno as TextPillAnnotation;
            const isEditing = editingTextId === pill.id;

            return (
              <div
                key={pill.id}
                onPointerDown={(e) => !isEditing && handlePointerDown(e, pill.id, 'body')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => {
                  e.stopPropagation();
                  selectAnnotation(pill.id);
                }}
                onDoubleClick={() => setEditingTextId(pill.id)}
                className={`absolute pointer-events-auto cursor-move select-none px-2.5 py-1 rounded-md backdrop-blur-md shadow-2xl flex items-center gap-1.5 transition-all ${
                  isSelected ? 'ring-1 ring-white shadow-technical-glow' : ''
                }`}
                style={{
                  left: `${pill.x}px`,
                  top: `${pill.y}px`,
                  backgroundColor: 'rgba(12, 12, 16, 0.85)',
                  border: `1px solid ${pill.color}`,
                  color: pill.color,
                  fontSize: `${pill.fontSize}px`,
                }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={pill.text}
                    autoFocus
                    onBlur={() => setEditingTextId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingTextId(null);
                    }}
                    onChange={(e) =>
                      updateAnnotation(pill.id, { text: e.target.value })
                    }
                    className="bg-transparent border-none outline-none text-white font-mono text-xs w-28"
                  />
                ) : (
                  <span className="font-mono font-medium tracking-tight whitespace-nowrap">
                    {pill.text}
                  </span>
                )}
              </div>
            );
          }

          // 3. Redact / Blur Box
          if (anno.type === 'redact-box') {
            const redact = anno as RedactBoxAnnotation;
            return (
              <div
                key={redact.id}
                onPointerDown={(e) => handlePointerDown(e, redact.id, 'body')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => {
                  e.stopPropagation();
                  selectAnnotation(redact.id);
                }}
                className={`absolute pointer-events-auto cursor-move select-none rounded backdrop-blur-md bg-black/45 border border-white/20 transition-all ${
                  isSelected ? 'ring-2 ring-brand-cyan/70' : ''
                }`}
                style={{
                  left: `${redact.x}px`,
                  top: `${redact.y}px`,
                  width: `${redact.width}px`,
                  height: `${redact.height}px`,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 4px, transparent 4px, transparent 8px)',
                }}
              >
                {/* Corner Resize Handle - Filtered out on Export */}
                {isSelected && (
                  <div
                    onPointerDown={(e) => handlePointerDown(e, redact.id, 'resize')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="stage-ignore-export absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-brand-cyan cursor-nwse-resize shadow-md"
                  />
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </>
  );
};
