import { useEffect, useRef, useState } from 'react';
import type { GrammarNote } from '../types';
import { loadGrammarNote } from '../lib/bank';
import { MarkdownNote } from './MarkdownNote';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  id: string;
  onClose: () => void;
}

/** Full-screen modal overlay — opens on top of a lesson without losing its place. */
export function GrammarView({ id, onClose }: Props) {
  const [note, setNote] = useState<GrammarNote | null>(null);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    setNote(null);
    setError('');
    loadGrammarNote(id)
      .then((n) => active && setNote(n))
      .catch((e) => active && setError(String(e.message ?? e)));
    return () => {
      active = false;
    };
  }, [id]);

  // Modal behaviour: focus the Close button, close on Escape, trap Tab focus.
  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !overlayRef.current) return;
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Grammar note"
      ref={overlayRef}
    >
      <div className="overlay-inner">
        <header className="topbar">
          <button type="button" className="link" onClick={onClose} ref={closeRef}>
            ← Close
          </button>
          <ThemeToggle />
        </header>
        <main>
          <article className="card grammar">
            {error && <p>Could not load this grammar note.</p>}
            {!error && !note && <p>Loading…</p>}
            {note && (
              <>
                <div className="meta">
                  {note.level && <span className="pill">{note.level}</span>}
                </div>
                <h1>{note.title}</h1>
                <MarkdownNote body={note.body} />
              </>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}
