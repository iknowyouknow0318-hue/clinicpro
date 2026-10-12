import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { inventoryService, InventoryItem } from '../api/services';

export const InventoryDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(50);

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getAllInventory();
      setInventory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const handleUpdateStock = async (invId: number) => {
    try {
      await inventoryService.updateQuantity(invId, newQuantity);
      setUpdatingId(null);
      loadInventory();
      alert('Stock updated successfully!');
    } catch (err: any) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  const filteredInventory = inventory.filter(item =>
    (item.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.genericName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.lowStock || (i.availableQuantity !== undefined && i.availableQuantity <= i.reorderLevel)).length;
  const totalStockCount = inventory.reduce((acc, i) => acc + (i.availableQuantity || i.quantity || 0), 0);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Inventory & Stock</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Manage medicine batches, stock levels, and reorder thresholds</p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <input type="text" className="form-control" placeholder="Search medicine, batch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-tile">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>TOTAL STOCK UNITS</div>
          <div className="stat-val" style={{ color: 'var(--primary)' }}>{totalStockCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Across active batches</div>
        </div>
        <div className="stat-tile">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>LOW STOCK ALERTS</div>
          <div className="stat-val" style={{ color: lowStockCount > 0 ? 'var(--red-accent)' : 'var(--green-accent)' }}>{lowStockCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Below reorder level</div>
        </div>
        <div className="stat-tile">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>FORMULATIONS</div>
          <div className="stat-val" style={{ color: 'var(--purple-accent)' }}>{inventory.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Active SKUs</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Unit</th>
                <th>Available</th>
                <th>Reorder Level</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.inventoryId}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.medicineName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.genericName} • {item.manufacturer}</div>
                  </td>
                  <td><code style={{ background: 'var(--bg-input)', padding: '0.15rem 0.35rem', borderRadius: '3px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>{item.batchNumber}</code></td>
                  <td>{item.unit}</td>
                  <td><strong style={{ color: item.lowStock ? 'var(--red-accent)' : 'var(--green-accent)' }}>{item.availableQuantity}</strong></td>
                  <td>{item.reorderLevel}</td>
                  <td>{item.expiryDate}</td>
                  <td>
                    {item.lowStock ? (
                      <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><AlertTriangle size={11} /> Low</span>
                    ) : (
                      <span className="badge badge-green">OK</span>
                    )}
                  </td>
                  <td>
                    {updatingId === item.inventoryId ? (
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <input type="number" className="form-control" style={{ width: '70px', padding: '0.25rem 0.4rem' }} value={newQuantity} onChange={(e) => setNewQuantity(Number(e.target.value))} />
                        <button onClick={() => handleUpdateStock(item.inventoryId)} className="btn btn-primary btn-sm">Save</button>
                        <button onClick={() => setUpdatingId(null)} className="btn btn-secondary btn-sm">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setUpdatingId(item.inventoryId); setNewQuantity((item.availableQuantity || item.quantity || 0) + 50); }} className="btn btn-secondary btn-sm">
                        <RefreshCw size={12} /> Replenish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
