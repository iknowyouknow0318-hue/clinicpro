import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Clock, 
  User, 
  Stethoscope,
  Zap
} from 'lucide-react';
import { queueService, patientService, Patient, Doctor } from '../../api/services';
import { Button } from '../shadcn/Button';
import { Badge } from '../shadcn/Badge';

export interface QuickTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  onTokenGenerated?: () => void;
}

export const QuickTokenModal: React.FC<QuickTokenModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  onTokenGenerated,
}) => {
  const [mode, setMode] = useState<'existing' | 'walkin'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>(patients[0]?.patientId || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | ''>(doctors[0]?.doctorId || '');
  const [priorityLevel, setPriorityLevel] = useState<'NORMAL' | 'PRIORITY' | 'URGENT'>('NORMAL');

  // Walk-in fields
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAge, setWalkinAge] = useState('');
  const [walkinGender, setWalkinGender] = useState('MALE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenResult, setTokenResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let patientIdToUse = selectedPatientId;

      if (mode === 'walkin') {
        if (!walkinName.trim()) {
          setError('Please enter patient full name');
          setLoading(false);
          return;
        }
        // Create basic patient on the fly
        const newPatient = await patientService.create({
          name: walkinName,
          phone: walkinPhone || '0000000000',
          gender: walkinGender,
          dob: '1995-01-01',
          address: 'Walk-in Patient',
        });
        patientIdToUse = newPatient.patientId;
      }

      if (!patientIdToUse || !selectedDoctorId) {
        setError('Please select both a patient and a doctor');
        setLoading(false);
        return;
      }

      const res = await queueService.checkIn({
        patientId: Number(patientIdToUse),
        doctorId: Number(selectedDoctorId),
        visitType: 'WALK_IN',
        priorityLevel,
      });

      setTokenResult(res);
      if (onTokenGenerated) onTokenGenerated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue token. Please check doctor availability.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetModal = () => {
    setTokenResult(null);
    setError('');
    setWalkinName('');
    setWalkinPhone('');
    setWalkinAge('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={resetModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-2xl)',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--primary-gradient-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'var(--primary-bg)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Issue Walk-in Token
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Fast-track queue ticket generation
              </p>
            </div>
          </div>

          <button
            onClick={resetModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {tokenResult ? (
            /* Issued Token Success Ticket */
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--green-bg)',
                  color: 'var(--green-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: 'var(--text-heading)' }}>
                Token Generated Successfully!
              </h4>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Patient added to live queue and doctor desk notified.
              </p>

              {/* Printable Ticket Box */}
              <div
                style={{
                  background: 'var(--bg-input)',
                  border: '2px dashed var(--primary-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Queue Token Number
                </div>
                <div
                  style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--primary-dark)',
                    lineHeight: 1.1,
                    margin: '0.4rem 0',
                    letterSpacing: '-0.03em',
                  }}
                >
                  #{tokenResult.tokenNumber}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Badge variant={tokenResult.priorityLevel === 'URGENT' ? 'destructive' : tokenResult.priorityLevel === 'PRIORITY' ? 'warning' : 'teal'}>
                    {tokenResult.priorityLevel} PRIORITY
                  </Badge>
                  <Badge variant="outline">
                    <Clock size={12} style={{ marginRight: '0.2rem' }} />
                    Est. Wait: {tokenResult.estimatedWaitMinutes || 15} mins
                  </Badge>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                    fontSize: '0.8rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Patient:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{tokenResult.patientName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Doctor:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{tokenResult.doctorName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Patients Ahead:</span>
                    <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{tokenResult.patientsAhead ?? 0} Patients</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Status:</span>
                    <div style={{ fontWeight: 600, color: 'var(--green-dark)' }}>WAITING IN LOBBY</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Button variant="outline" icon={<Printer size={16} />} onClick={handlePrint}>
                  Print Slip
                </Button>
                <Button onClick={() => setTokenResult(null)}>
                  Issue Another Token
                </Button>
              </div>
            </div>
          ) : (
            /* Token Creation Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {error && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--red-bg)',
                    border: '1px solid var(--red-border)',
                    color: 'var(--red-dark)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Mode switch (Existing vs Walk-in) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '0.25rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: mode === 'existing' ? 'var(--bg-card)' : 'transparent',
                    border: mode === 'existing' ? '1px solid var(--border-color)' : 'none',
                    fontWeight: mode === 'existing' ? 700 : 500,
                    fontSize: '0.8rem',
                    color: mode === 'existing' ? 'var(--text-heading)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Existing Registered Patient
                </button>
                <button
                  type="button"
                  onClick={() => setMode('walkin')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: mode === 'walkin' ? 'var(--bg-card)' : 'transparent',
                    border: mode === 'walkin' ? '1px solid var(--border-color)' : 'none',
                    fontWeight: mode === 'walkin' ? 700 : 500,
                    fontSize: '0.8rem',
                    color: mode === 'walkin' ? 'var(--text-heading)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  + New Walk-in Patient
                </button>
              </div>

              {/* Patient Selection */}
              {mode === 'existing' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Select Patient
                  </label>
                  <select
                    className="input-field"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    required
                  >
                    <option value="">-- Choose registered patient --</option>
                    {patients.map((p) => (
                      <option key={p.patientId} value={p.patientId}>
                        {p.name} ({p.phone || 'No phone'}) - {p.gender || 'Patient'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Rahul Sharma"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="10-digit phone"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Age
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="Age"
                        value={walkinAge}
                        onChange={(e) => setWalkinAge(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Gender
                      </label>
                      <select
                        className="input-field"
                        value={walkinGender}
                        onChange={(e) => setWalkinGender(e.target.value)}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Assign Consulting Doctor
                </label>
                <select
                  className="input-field"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  required
                >
                  <option value="">-- Choose on-duty doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>
                      {d.name} - {d.specialty} ({d.availability || 'AVAILABLE'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Triage Priority Tier
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { key: 'NORMAL', label: 'Regular', desc: 'Standard queue' },
                    { key: 'PRIORITY', label: 'Senior / Child', desc: 'Accelerated' },
                    { key: 'URGENT', label: 'Emergency', desc: 'Immediate chair' },
                  ].map((tier) => (
                    <div
                      key={tier.key}
                      onClick={() => setPriorityLevel(tier.key as any)}
                      style={{
                        border: priorityLevel === tier.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius)',
                        padding: '0.6rem 0.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: priorityLevel === tier.key ? 'var(--primary-bg)' : 'var(--bg-input)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: priorityLevel === tier.key ? 'var(--primary-dark)' : 'var(--text-heading)' }}>
                        {tier.label}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{tier.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <div style={{ marginTop: '0.5rem' }}>
                <Button
                  type="submit"
                  loading={loading}
                  style={{ width: '100%' }}
                  icon={<Zap size={16} />}
                >
                  Generate Live Token & Check-In
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
