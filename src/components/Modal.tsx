import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modale__fond" onMouseDown={onClose}>
      <div
        className={`modale${wide ? ' modale--large' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modale__entete">
          <h2>{title}</h2>
          <button className="modale__fermer" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>
        <div className="modale__corps">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
