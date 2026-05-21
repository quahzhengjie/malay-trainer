import type { ComponentType } from 'react';
import { GrammarIcon, LearnIcon, ReviewIcon } from './icons';

export type Tab = 'learn' | 'review' | 'grammar';

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
  /** Count of questions due — shown as a badge on the Review tab. */
  reviewDue: number;
}

const TABS: { id: Tab; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'learn', label: 'Learn', Icon: LearnIcon },
  { id: 'review', label: 'Review', Icon: ReviewIcon },
  { id: 'grammar', label: 'Grammar', Icon: GrammarIcon },
];

export function TabBar({ tab, onChange, reviewDue }: Props) {
  return (
    <nav className="tabbar">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab ${tab === id ? 'tab-active' : ''}`}
          onClick={() => onChange(id)}
        >
          <span className="tab-icon">
            <Icon size={21} />
          </span>
          <span>{label}</span>
          {id === 'review' && reviewDue > 0 && <span className="tab-dot">{reviewDue}</span>}
        </button>
      ))}
    </nav>
  );
}
