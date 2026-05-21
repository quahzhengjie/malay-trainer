import { useEffect, useState } from 'react';
import type { GrammarNote } from '../types';
import { loadGrammarNote } from '../lib/bank';
import { MarkdownNote } from './MarkdownNote';

interface Props {
  id: string;
  onClose: () => void;
}

/** Full-screen overlay so it can open on top of a lesson without losing its place. */
export function GrammarView({ id, onClose }: Props) {
  const [note, setNote] = useState<GrammarNote | null>(null);
  const [error, setError] = useState('');

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

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="overlay-inner">
        <header className="topbar">
          <button type="button" className="link" onClick={onClose}>
            ← Close
          </button>
        </header>
        <main>
          <article className="card grammar">
            {error && <p>⚠️ {error}</p>}
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
