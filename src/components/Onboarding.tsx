import { useState } from 'react';
import type { Level } from '../types';

interface PlacementOption {
  label: string;
  detail: string;
  /** Level to begin at; null = absolute beginner (start at A1, seed nothing). */
  start: Level | null;
}

const PLACEMENT: PlacementOption[] = [
  { label: 'New to Malay', detail: 'Start from the very beginning, at A1.', start: null },
  {
    label: 'I know the basics',
    detail: 'Greetings, numbers, simple sentences — begin at A2.',
    start: 'A2',
  },
  {
    label: 'Comfortable with everyday Malay',
    detail: 'Skip ahead to the intermediate grammar at B1.',
    start: 'B1',
  },
  { label: 'Advanced', detail: 'Jump to the harder material at B2.', start: 'B2' },
];

interface Props {
  /** `start` is the level to begin at; null = absolute beginner. */
  onComplete: (start: Level | null) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'placement'>('welcome');

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="overlay-inner">
        <main>
          {step === 'welcome' ? (
            <section className="card onboard">
              <span className="brand-mark onboard-mark">BM</span>
              <h1>Selamat datang!</h1>
              <p>
                Learn Bahasa Melayu — from your first words through to fluent, at your
                own pace.
              </p>
              <ul className="onboard-list">
                <li>
                  <strong>Learn</strong> — lessons that teach a point, then practise it.
                </li>
                <li>
                  <strong>Review</strong> — spaced repetition brings questions back so
                  they stick.
                </li>
                <li>
                  <strong>Grammar</strong> — reference notes, plus a cheat-sheet on Home.
                </li>
              </ul>
              <p className="explain">Your progress is saved on this device.</p>
              <button
                type="button"
                className="primary block"
                autoFocus
                onClick={() => setStep('placement')}
              >
                Get started
              </button>
            </section>
          ) : (
            <section className="card onboard">
              <h1>How much Malay do you know?</h1>
              <p className="explain">
                This just sets where you begin — every lesson stays open to explore.
              </p>
              <div className="placement-list">
                {PLACEMENT.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className="placement-card"
                    onClick={() => onComplete(opt.start)}
                  >
                    <span className="placement-label">{opt.label}</span>
                    <span className="placement-detail">{opt.detail}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
