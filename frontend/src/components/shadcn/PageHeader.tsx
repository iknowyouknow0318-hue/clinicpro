import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  badge,
  actions,
  style = {},
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        marginBottom: '1.75rem',
        ...style,
      }}
    >
      {/* Breadcrumb Trail */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={13} color="var(--text-muted)" />}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: isLast ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isLast ? 600 : 400 }}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Row: Title & Action Slot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-heading)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
