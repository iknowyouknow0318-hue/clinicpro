import React from 'react';
import { AlertTriangle, Package, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../shadcn/Card';
import { Badge } from '../shadcn/Badge';
import { Button } from '../shadcn/Button';

export interface InventoryAlertItem {
  id: number;
  name: string;
  batchNumber: string;
  currentStock: number;
  threshold: number;
  expiryDate: string;
  isExpired?: boolean;
  isLowStock?: boolean;
}

export interface ClinicInventoryAlertWidgetProps {
  alerts: InventoryAlertItem[];
  onNavigateInventory?: () => void;
}

export const ClinicInventoryAlertWidget: React.FC<ClinicInventoryAlertWidgetProps> = ({
  alerts,
  onNavigateInventory,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={<AlertTriangle size={16} color="var(--amber-accent)" />}
          badge={
            alerts.length > 0 ? (
              <Badge variant="warning" dot>
                {alerts.length} Action Needed
              </Badge>
            ) : undefined
          }
        >
          Pharmacy & Inventory Watch
        </CardTitle>
        {onNavigateInventory && (
          <Button variant="ghost" size="sm" onClick={onNavigateInventory} iconRight={<ArrowRight size={14} />}>
            Manage
          </Button>
        )}
      </CardHeader>

      <CardContent style={{ padding: '0.75rem 1.25rem' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={24} style={{ margin: '0 auto 0.4rem auto', opacity: 0.5 }} />
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>All Stock Levels Healthy</div>
            <div style={{ fontSize: '0.74rem' }}>No medicines below threshold or near expiration.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {alerts.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>Batch: #{item.batchNumber}</span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Calendar size={11} /> Exp: {item.expiryDate}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: item.currentStock <= item.threshold ? 'var(--red-dark)' : 'var(--text-heading)' }}>
                    {item.currentStock} Units
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Min: {item.threshold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
