import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  indicatorStrip?: 'emerald' | 'amber' | 'crimson' | 'sapphire';
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  indicatorStrip,
  className = '', 
  style = {}, 
  ...props 
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'interactive':
        return {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        };
      case 'glass':
        return {
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        };
      case 'elevated':
        return {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        };
      default:
        return {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        };
    }
  };

  const stripClass = indicatorStrip ? `queue-card-strip-${indicatorStrip}` : '';

  return (
    <div
      style={{
        ...getVariantStyles(),
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={`shadcn-card ${stripClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  style = {}, 
  ...props 
}) => (
  <div
    style={{
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-light)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, icon, badge, style = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', ...style }}>
    {icon && (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--primary-bg)',
        color: 'var(--primary)',
      }}>
        {icon}
      </div>
    )}
    <h3 style={{
      margin: 0,
      fontSize: '0.98rem',
      fontWeight: 600,
      color: 'var(--text-heading)',
      letterSpacing: '-0.01em',
    }}>
      {children}
    </h3>
    {badge}
  </div>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  style = {},
  ...props
}) => (
  <p
    style={{
      margin: '0.2rem 0 0 0',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      lineHeight: 1.4,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  style = {}, 
  ...props 
}) => (
  <div
    style={{
      padding: '1.25rem 1.5rem',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  style = {}, 
  ...props 
}) => (
  <div
    style={{
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-input)',
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
