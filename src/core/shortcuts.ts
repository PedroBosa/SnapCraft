import { useEffect } from 'react';

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

export interface ShortcutHandlers {
  onCopyImage?: () => void;
  onDownload?: () => void;
  onOpenCommandBar?: () => void;
  onDeleteAnnotation?: () => void;
}

export function useGlobalShortcuts({
  onCopyImage,
  onDownload,
  onOpenCommandBar,
  onDeleteAnnotation,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isEditableElement(e.target);
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // ⌘K / Ctrl+K or ? (when not typing in an input): Open Command Bar
      if (
        (isCmdOrCtrl && e.key.toLowerCase() === 'k') ||
        (!isInput && e.key === '?')
      ) {
        e.preventDefault();
        onOpenCommandBar?.();
        return;
      }

      // ⌘S / Ctrl+S: Quick Export Download
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onDownload?.();
        return;
      }

      // ⌘C / Ctrl+C: Copy rendered image if no text is actively selected
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        const selectedText = window.getSelection()?.toString().trim();
        if (!selectedText && !isInput) {
          e.preventDefault();
          onCopyImage?.();
          return;
        }
      }

      // Delete / Backspace: Remove selected annotation (only when not typing in an input)
      if (!isInput && (e.key === 'Delete' || e.key === 'Backspace')) {
        onDeleteAnnotation?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCopyImage, onDownload, onOpenCommandBar, onDeleteAnnotation]);
}
