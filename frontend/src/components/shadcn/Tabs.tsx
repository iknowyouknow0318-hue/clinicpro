import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  style?: React.CSSProperties;
  variant?: 'pill' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  style = {},
  variant = 'pill',
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: variant === 'pill' ? '0.25rem' : '0',
        borderRadius: variant === 'pill' ? 'var(--radius)' : '0',
        background: variant === 'pill' ? 'var(--bg-input)' : 'transparent',
        border: variant === 'pill' ? '1px solid var(--border-color)' : 'none',
        borderBottom: variant === 'underline' ? '1px solid var(--border-color)' : 'none',
        gap: variant === 'pill' ? '0.2rem' : '1.25rem',
        overflowX: 'auto',
        maxWidth: '100%',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.2rem',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative',
                marginBottom: '-1px',
                outline: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  background: isActive ? 'var(--primary-bg-strong)' : 'var(--bg-input)',
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'var(--text-heading)' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                background: isActive ? 'var(--primary-bg)' : 'var(--border-light)',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
