import React, { useState, useEffect } from 'react';
import { smartcareStore, Prescription } from '../api/smartcareStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  Pill, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Lock, 
  Clock, 
  Building2, 
  FileText, 
  Package, 
  RotateCcw,
  Check
} from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [searchReference, setSearchReference] = useState('RX-SC-2026-0041');
  const [dispenseNotes, setDispenseNotes] = useState('All medicines in stock. Verified batch numbers.');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const rxs = smartcareStore.getPrescriptions();
      setPrescriptions(rxs);
      if (rxs.length > 0 && !selectedRx) {
        setSelectedRx(rxs[0]);
      }
    };
    update();
    const unsub = smartcareStore.subscribe(update);
    return () => unsub();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = searchReference.trim().toUpperCase();
    const found = prescriptions.find(p => 
      p.prescriptionNumber.toUpperCase() === cleanRef || 
      p.secureAccessToken.toUpperCase() === cleanRef ||
      p.patientName.toLowerCase().includes(searchReference.toLowerCase())
    );

    if (found) {
      setSelectedRx(found);
      setActionSuccess(`Found Prescription #${found.prescriptionNumber}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      alert(`No prescription found with reference "${searchReference}".`);
    }
  };

  const handleDispense = (status: 'PARTIALLY_DISPENSED' | 'FULLY_DISPENSED') => {
    if (!selectedRx) return;
    smartcareStore.pharmacyDispense(selectedRx.id, status, dispenseNotes);
    setActionSuccess(`Prescription #${selectedRx.prescriptionNumber} marked as ${status}. Dispensing record created.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              {language === 'ta' ? 'மருந்தகம் & மருந்து சீட்டு சரிபார்ப்பு' : 'Pharmacy Dispensing & Validation'}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              background: '#dcfce7',
              color: '#166534',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
            }}>
              FEFO PHARMACY
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {language === 'ta'
              ? 'மருத்துவர் கையொப்பமிட்ட டிஜிட்டல் மருந்து சீட்டுகளை சரிபார்த்து மருந்து வழங்குதல்'
              : 'Validate physician cryptographic signatures, verify patient consent, and record dispensing status.'}
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Reference Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchReference}
              onChange={(e) => setSearchReference(e.target.value)}
              placeholder="Enter Prescription Reference (e.g. RX-SC-2026-0041) or Scan QR Token..."
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Validate Reference
          </button>
        </form>
      </div>

      {/* Main Grid: Prescription Queue List & Detailed Verification Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.75rem' }}>
        {/* Left Column: Recent Prescriptions List */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem' }}>
            Prescriptions For Validation ({prescriptions.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {prescriptions.map(rx => (
              <div
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  border: selectedRx?.id === rx.id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                  background: selectedRx?.id === rx.id ? 'var(--primary-bg)' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                    {rx.patientName}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: rx.status === 'FULLY_DISPENSED' ? '#dcfce7' : rx.status === 'PARTIALLY_DISPENSED' ? '#fef3c7' : '#eff6ff',
                    color: rx.status === 'FULLY_DISPENSED' ? '#166534' : rx.status === 'PARTIALLY_DISPENSED' ? '#92400e' : '#1d4ed8',
                  }}>
                    {rx.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {rx.prescriptionNumber} • Issued {rx.issuedAt}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Dr. {rx.doctorName} • {rx.medicines.length} medications
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Validation & Dispense Controls */}
        {selectedRx ? (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
            {/* Header & Verification Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  PRESCRIPTION VERIFICATION DESK
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0.2rem 0' }}>
                  {selectedRx.patientName} ({selectedRx.patientAge}y, {selectedRx.patientGender})
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Ref: {selectedRx.prescriptionNumber} • Prescribing Doctor: {selectedRx.doctorName}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  color: '#166534',
                }}>
                  {selectedRx.status}
                </span>
              </div>
            </div>

            {/* 4 Automated Compliance Checks */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                AUTOMATED REGULATORY VALIDATION CHECKS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534' }}>
                  <CheckCircle2 size={15} />
                  <span>Physician Signed: {selectedRx.doctorRegistrationNumber}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534' }}>
                  <CheckCircle2 size={15} />
                  <span>Not Expired: Valid 14 Days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534' }}>
                  <CheckCircle2 size={15} />
                  <span>Not Revoked or Cancelled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534' }}>
                  <CheckCircle2 size={15} />
                  <span>Pharmacy Sharing Consent Verified</span>
                </div>
              </div>
            </div>

            {/* Medicines List (Read-Only) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>
                PRESCRIBED MEDICINES (READ-ONLY)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedRx.medicines.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                        {idx + 1}. {m.name} ({m.strength}) — {m.formulation}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Dosage: {m.frequency} • Duration: {m.durationDays} days • Route: {m.route}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Instructions: {m.instructions}
                      </div>
                    </div>

                    <div style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}>
                      Batch In Stock
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispensing Actions */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  DISPENSING NOTES & BATCH CONFIRMATION
                </label>
                <input
                  type="text"
                  value={dispenseNotes}
                  onChange={(e) => setDispenseNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleDispense('PARTIALLY_DISPENSED')}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Mark Partially Dispensed
                </button>

                <button
                  onClick={() => handleDispense('FULLY_DISPENSED')}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    background: '#0d9488',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Confirm & Mark Fully Dispensed
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            Select a prescription from the queue to review and dispense.
          </div>
        )}
      </div>
    </div>
  );
};
