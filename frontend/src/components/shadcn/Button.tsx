import React from 'react';

export type ButtonVariant = 
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'link';

export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  icon,
  iconRight,
  loading = false,
  children,
  style = {},
  disabled,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'destructive':
        return {
          background: 'var(--red-dark, #dc2626)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
        };
      case 'success':
        return {
          background: 'var(--green-dark, #059669)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
        };
      case 'link':
        return {
          background: 'transparent',
          color: 'var(--primary)',
          border: 'none',
          padding: 0,
          textDecoration: 'underline',
        };
      default:
        return {
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    if (variant === 'link') return {};
    switch (size) {
      case 'sm':
        return {
          padding: '0.38rem 0.75rem',
          fontSize: '0.78rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.35rem',
          height: '32px',
        };
      case 'lg':
        return {
          padding: '0.75rem 1.5rem',
          fontSize: '0.92rem',
          borderRadius: 'var(--radius)',
          gap: '0.6rem',
          height: '44px',
        };
      case 'icon':
        return {
          padding: 0,
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          justifyContent: 'center',
        };
      default:
        return {
          padding: '0.52rem 1.1rem',
          fontSize: '0.84rem',
          borderRadius: 'var(--radius)',
          gap: '0.45rem',
          height: '38px',
        };
    }
  };

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        outline: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      disabled={disabled || loading}
      className={`shadcn-btn ${className}`}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
};
