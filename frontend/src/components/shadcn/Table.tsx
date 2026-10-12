import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  style = {},
  className = '',
  ...props
}) => (
  <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.82rem',
        color: 'var(--text-primary)',
        ...style,
      }}
      className={`shadcn-table ${className}`}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  style = {},
  ...props
}) => (
  <thead
    style={{
      background: 'var(--bg-input)',
      borderBottom: '1px solid var(--border-color)',
      ...style,
    }}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  style = {},
  ...props
}) => (
  <tbody
    style={{
      ...style,
    }}
    {...props}
  >
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean }> = ({
  children,
  isSelected = false,
  style = {},
  ...props
}) => (
  <tr
    style={{
      borderBottom: '1px solid var(--border-light)',
      background: isSelected ? 'var(--primary-bg)' : 'transparent',
      transition: 'background-color 0.15s ease',
      cursor: props.onClick ? 'pointer' : 'default',
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
    }}
    onMouseLeave={(e) => {
      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
    }}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  style = {},
  ...props
}) => (
  <th
    style={{
      padding: '0.75rem 1rem',
      fontWeight: 600,
      fontSize: '0.72rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap',
      ...style,
    }}
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  style = {},
  ...props
}) => (
  <td
    style={{
      padding: '0.85rem 1rem',
      verticalAlign: 'middle',
      ...style,
    }}
    {...props}
  >
    {children}
  </td>
);
