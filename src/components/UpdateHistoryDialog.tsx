import { useEffect, useRef, useState } from 'react';
import { UPDATE_HISTORY } from '../content/updateHistory';
export interface UpdateHistoryDialogProps { }
export function UpdateHistoryDialog(_: UpdateHistoryDialogProps) {
  const [open, setOpen] = useState(false); const triggerRef = useRef<HTMLButtonElement>(null); const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; closeRef.current?.focus(); const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [open]);
  return <><button ref={triggerRef} type="button" className="update-history-trigger" onClick={() => setOpen(true)}>업데이트 내역</button>{open && <div className="update-history-panel"><div className="update-history-dialog" role="dialog" aria-modal="true" aria-labelledby="update-history-title"><h2 id="update-history-title">업데이트 내역</h2><ol>{UPDATE_HISTORY.map((entry) => <li key={`${entry.date}-${entry.category}`}><strong>{entry.date} · {entry.category}</strong><span>{entry.summary}</span></li>)}</ol><button ref={closeRef} type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>업데이트 내역 닫기</button></div></div>}</>;
}
