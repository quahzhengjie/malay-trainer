import type { ComponentType } from 'react';
import { GrammarIcon, HomeIcon, LearnIcon, ReviewIcon } from './icons';

export type Tab = 'home' | 'learn' | 'review' | 'grammar';

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
  /** Count of questions due — shown as a badge on the Review tab. */
  reviewDue: number;
}

const TABS: { id: Tab; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'learn', label: 'Learn', Icon: LearnIcon },
  { id: 'review', label: 'Review', Icon: ReviewIcon },
  { id: 'grammar', label: 'Grammar', Icon: GrammarIcon },
];

export function TabBar({ tab, onChange, reviewDue }: Props) {
  return (
    <nav className="tabbar">
      {TABS.map(({ id, label, Icon }) => {
        const dueHere = id === 'review' && reviewDue > 0;
        return (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'tab-active' : ''}`}
            aria-current={tab === id ? 'page' : undefined}
            aria-label={dueHere ? `${label}, ${reviewDue} due for review` : undefined}
            onClick={() => onChange(id)}
          >
            <span className="tab-icon">
              <Icon size={21} />
            </span>
            <span>{label}</span>
            {dueHere && (
              <span className="tab-dot" aria-hidden="true">
                {reviewDue > 99 ? '99+' : reviewDue}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
