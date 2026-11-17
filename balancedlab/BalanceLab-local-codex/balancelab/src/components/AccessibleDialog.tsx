import { CircleStop } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
export function AccessibleDialog({ children, titleId, onClose, className = '', onEmergency }: { children: ReactNode; titleId: string; onClose: () => void; className?: string; onEmergency?: () => Promise<unknown> }) {
  const root = useRef<HTMLElement>(null); const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => [...(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]') ?? [])];
    (focusable()[0] ?? root.current)?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key === 'Tab') { const items = focusable(), first = items[0], last = items.at(-1); if (!first) { event.preventDefault(); return; } if (event.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    }
    document.addEventListener('keydown', key); return () => { document.removeEventListener('keydown', key); previous?.focus(); };
  }, []);
  return <div className="modal-backdrop"><section ref={root} tabIndex={-1} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>{children}{onEmergency&&<div className="dialog-safety-action"><button className="button emergency" onClick={()=>void onEmergency()}><CircleStop size={16}/>Emergency stop</button></div>}</section></div>;
}
