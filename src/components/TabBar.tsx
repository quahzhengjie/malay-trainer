export type Tab = 'learn' | 'review' | 'grammar';

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
  /** Count of questions due — shown as a badge on the Review tab. */
  reviewDue: number;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'learn', label: 'Learn', icon: '📚' },
  { id: 'review', label: 'Review', icon: '🔁' },
  { id: 'grammar', label: 'Grammar', icon: '📖' },
];

export function TabBar({ tab, onChange, reviewDue }: Props) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab ${tab === t.id ? 'tab-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-icon">{t.icon}</span>
          <span>{t.label}</span>
          {t.id === 'review' && reviewDue > 0 && <span className="tab-dot">{reviewDue}</span>}
        </button>
      ))}
    </nav>
  );
}
