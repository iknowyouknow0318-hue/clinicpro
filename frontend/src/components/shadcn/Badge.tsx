import React from 'react';

export type BadgeVariant = 
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'purple'
  | 'teal';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  dot = false,
  pulse = false,
  children,
  style = {},
  ...props
}) => {
  const getBadgeStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return {
          background: 'var(--green-bg)',
          color: 'var(--green-dark, #059669)',
          borderColor: 'var(--green-border)',
        };
      case 'warning':
        return {
          background: 'var(--amber-bg)',
          color: 'var(--amber-dark, #d97706)',
          borderColor: 'var(--amber-border)',
        };
      case 'destructive':
        return {
          background: 'var(--red-bg)',
          color: 'var(--red-dark, #dc2626)',
          borderColor: 'var(--red-border)',
        };
      case 'info':
        return {
          background: 'var(--blue-bg)',
          color: 'var(--blue-dark, #2563eb)',
          borderColor: 'var(--blue-border)',
        };
      case 'purple':
        return {
          background: 'var(--purple-bg)',
          color: 'var(--purple-dark, #7c3aed)',
          borderColor: 'var(--purple-border)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-color)',
        };
      case 'secondary':
        return {
          background: 'var(--bg-input)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-light)',
        };
      case 'teal':
        return {
          background: 'var(--primary-bg)',
          color: 'var(--primary-dark)',
          borderColor: 'var(--primary-border)',
        };
      default:
        return {
          background: 'var(--primary-bg)',
          color: 'var(--primary-dark)',
          borderColor: 'var(--primary-border)',
        };
    }
  };

  const getDotColor = (): string => {
    switch (variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'destructive': return '#ef4444';
      case 'info': return '#3b82f6';
      case 'purple': return '#8b5cf6';
      default: return 'var(--primary)';
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.72rem',
        fontWeight: 600,
        lineHeight: 1.2,
        border: '1px solid transparent',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...getBadgeStyle(),
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: getDotColor(),
            animation: pulse ? 'pulse 2s infinite ease-in-out' : 'none',
          }}
        />
      )}
      {children}
    </span>
  );
};
