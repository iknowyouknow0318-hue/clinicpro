import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  colorScheme?: 'teal' | 'blue' | 'amber' | 'green' | 'purple' | 'rose';
  progress?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  colorScheme = 'teal',
  progress,
  onClick,
  style = {},
}) => {
  const getThemeColors = () => {
    switch (colorScheme) {
      case 'blue':
        return {
          bg: 'rgba(59, 130, 246, 0.08)',
          border: 'rgba(59, 130, 246, 0.2)',
          iconColor: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        };
      case 'amber':
        return {
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.2)',
          iconColor: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        };
      case 'green':
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.2)',
          iconColor: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981, #059669)',
        };
      case 'purple':
        return {
          bg: 'rgba(139, 92, 246, 0.08)',
          border: 'rgba(139, 92, 246, 0.2)',
          iconColor: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        };
      case 'rose':
        return {
          bg: 'rgba(244, 63, 94, 0.08)',
          border: 'rgba(244, 63, 94, 0.2)',
          iconColor: '#f43f5e',
          gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
        };
      default:
        return {
          bg: 'rgba(13, 148, 136, 0.08)',
          border: 'rgba(13, 148, 136, 0.2)',
          iconColor: '#0d9488',
          gradient: 'linear-gradient(135deg, #0d9488, #0891b2)',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <Card
      variant={onClick ? 'interactive' : 'default'}
      onClick={onClick}
      style={{
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Top row: Title and Icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '0.35rem',
          }}>
            {title}
          </span>
          <div style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-heading)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            {value}
          </div>
        </div>

        {icon && (
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-xs)',
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Progress bar if present */}
      {typeof progress === 'number' && (
        <div style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          background: 'var(--border-light)',
          margin: '0.4rem 0 0.75rem 0',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            height: '100%',
            background: colors.gradient,
            borderRadius: '2px',
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}

      {/* Bottom row: Trend and Subtitle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
      }}>
        {trend && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.12rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.68rem',
            background: trend.isPositive ? 'var(--green-bg)' : 'var(--red-bg)',
            color: trend.isPositive ? 'var(--green-dark)' : 'var(--red-dark)',
            border: `1px solid ${trend.isPositive ? 'var(--green-border)' : 'var(--red-border)'}`,
          }}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
        {subtitle && (
          <span style={{ color: 'var(--text-muted)' }}>
            {trend?.label || subtitle}
          </span>
        )}
      </div>
    </Card>
  );
};
