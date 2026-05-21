import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { GrammarNote } from '../types';
import { loadGrammarNote } from '../lib/bank';

interface Props {
  id: string;
  onClose: () => void;
}

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
    <div className="app">
      <header className="topbar">
        <button type="button" className="link" onClick={onClose}>
          ← Back to practice
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
              <Markdown remarkPlugins={[remarkGfm]}>
                {`# ${note.title}\n\n${note.body}`}
              </Markdown>
            </>
          )}
        </article>
      </main>
    </div>
  );
}
