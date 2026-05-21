import { useEffect, useState } from 'react';
import type { GrammarIndex } from '../types';
import { loadGrammarIndex } from '../lib/bank';

export function GrammarList({ onOpen }: { onOpen: (id: string) => void }) {
  const [index, setIndex] = useState<GrammarIndex | null>(null);

  useEffect(() => {
    loadGrammarIndex()
      .then(setIndex)
      .catch(() => setIndex({ notes: [] }));
  }, []);

  if (!index) return <div className="centered">Loading…</div>;

  return (
    <div className="course">
      <section className="chapter">
        <h2 className="chapter-title">Grammar notes</h2>
        <div className="lesson-list">
          {index.notes.map((n) => (
            <button
              key={n.id}
              type="button"
              className="lesson-card"
              onClick={() => onOpen(n.id)}
            >
              <div className="lesson-card-top">
                <span className="lesson-name">{n.title}</span>
                {n.level && <span className="lesson-badge">{n.level}</span>}
              </div>
            </button>
          ))}
          {index.notes.length === 0 && <p className="explain">No grammar notes yet.</p>}
        </div>
      </section>
    </div>
  );
}
