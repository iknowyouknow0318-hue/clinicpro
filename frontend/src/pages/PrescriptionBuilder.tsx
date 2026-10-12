import React, { useState, useEffect } from 'react';
import { FileText, Pill, Printer, Search, Clock } from 'lucide-react';
import { prescriptionService, Prescription } from '../api/services';

export const PrescriptionBuilder: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.getAll().then(data => {
      setPrescriptions(data || []);
      if (data && data.length > 0) setSelectedRx(data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const filteredRx = prescriptions.filter(p => 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prescriptionId.toString().includes(searchTerm)
  );

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Prescriptions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>View and manage digital prescription records</p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <input type="text" className="form-control" placeholder="Search patient, doctor, Rx #..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.25rem' }}>
        {/* Prescription List */}
        <div className="glass-card fade-in-up" style={{ padding: '1.25rem', maxHeight: '700px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Prescription List</span>
            <span className="badge badge-teal">{filteredRx.length}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredRx.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <FileText size={24} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
                <div>No prescriptions found</div>
              </div>
            ) : (
              filteredRx.map(rx => (
                <div key={rx.prescriptionId} onClick={() => setSelectedRx(rx)} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: selectedRx?.prescriptionId === rx.prescriptionId ? 'var(--primary-bg-strong)' : 'var(--bg-input)',
                  border: selectedRx?.prescriptionId === rx.prescriptionId ? '1.5px solid var(--primary-border)' : '1.5px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { if (selectedRx?.prescriptionId !== rx.prescriptionId) { e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}}
                onMouseLeave={(e) => { if (selectedRx?.prescriptionId !== rx.prescriptionId) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}}
                >
                  {selectedRx?.prescriptionId === rx.prescriptionId && (
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--primary-gradient)', borderRadius: '0 2px 2px 0' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Rx #{rx.prescriptionId}</span>
                    <span className={`badge ${rx.status === 'DISPENSED' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.62rem' }}>
                      {rx.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{rx.patientName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={10} /> Dr. {rx.doctorName} • {new Date(rx.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedRx ? (
          <div className="glass-card fade-in-up" style={{ padding: '1.75rem', animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  <FileText size={14} /> PRESCRIPTION
                </div>
                <h2 style={{ fontSize: '1.35rem', marginTop: '0.15rem', color: 'var(--text-heading)', fontWeight: 800 }}>Rx #{selectedRx.prescriptionId}</h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={11} /> Consultation #{selectedRx.consultationId} • {new Date(selectedRx.issuedAt).toLocaleString()}
                </div>
              </div>
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm"><Printer size={14} /> Print</button>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Patient</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-heading)' }}>{selectedRx.patientName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ID: #{selectedRx.patientId}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Prescribing Doctor</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-heading)' }}>Dr. {selectedRx.doctorName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ID: #{selectedRx.doctorId}</div>
              </div>
            </div>

            {/* Medications */}
            <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', background: 'var(--green-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={13} color="var(--green-accent)" />
              </div>
              Medications ({selectedRx.items?.length || 0})
            </h3>
            <div className="table-container" style={{ marginBottom: '1.25rem' }}>
              <table className="data-table">
                <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Qty</th></tr></thead>
                <tbody>
                  {selectedRx.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.medicineName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.genericName}</div>
                      </td>
                      <td>{item.dosage}</td>
                      <td>{item.frequency}</td>
                      <td>{item.durationDays} days</td>
                      <td><strong style={{ color: 'var(--green-accent)' }}>{item.quantity}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRx.instructions && (
              <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Instructions</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.6 }}>{selectedRx.instructions}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pharmacy Status</div>
              <span className={`badge ${selectedRx.status === 'DISPENSED' ? 'badge-green' : 'badge-blue'}`}>{selectedRx.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={32} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.95rem' }}>Select a prescription to view details.</div>
          </div>
        )}
      </div>
    </div>
  );
};
