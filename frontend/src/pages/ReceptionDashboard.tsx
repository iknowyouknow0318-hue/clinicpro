import React, { useState, useEffect } from 'react';
import { smartcareStore, QueueEntry, Doctor, Patient, NotificationItem } from '../api/smartcareStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Volume2, 
  RotateCcw, 
  UserPlus, 
  ShieldAlert, 
  Clock, 
  MessageSquare, 
  Send,
  Building2,
  FileText,
  Filter,
  X,
  Smartphone
} from 'lucide-react';
import { phoneOtpService } from '../api/phoneOtpService';

export const ReceptionDashboard: React.FC = () => {
  const { language, t, getLocalized } = useLanguage();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'CHECKIN' | 'QUEUE' | 'TRIAGE' | 'NOTIFICATIONS'>('CHECKIN');

  // Check-In Form
  const [checkInToken, setCheckInToken] = useState('A-107');
  const [secondFactorType, setSecondFactorType] = useState<'OTP' | 'DOB' | 'PHONE_LAST_4'>('OTP');
  const [secondFactorValue, setSecondFactorValue] = useState('123456');
  const [checkInMessage, setCheckInMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [printTokenModal, setPrintTokenModal] = useState<QueueEntry | null>(null);
  const [skipModal, setSkipModal] = useState<QueueEntry | null>(null);
  const [skipReason, setSkipReason] = useState('Patient called but did not appear at room');
  const [overrideModal, setOverrideModal] = useState<QueueEntry | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overridePriority, setOverridePriority] = useState<'EMERGENCY' | 'HIGH_PRIORITY'>('HIGH_PRIORITY');

  // Triage Emergency Form
  const [triagePatientId, setTriagePatientId] = useState<number>(8); // default Arumugam P
  const [triageDoctorId, setTriageDoctorId] = useState<number>(1);
  const [triagePriority, setTriagePriority] = useState<'EMERGENCY' | 'HIGH_PRIORITY'>('EMERGENCY');
  const [triageReason, setTriageReason] = useState('Acute chest discomfort, diaphoresis, SpO2 90%');
  const [triageNotice, setTriageNotice] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setQueue(smartcareStore.getActiveQueueSorted());
      setDoctors(smartcareStore.getDoctors());
      setPatients(smartcareStore.getPatients());
      setNotifications(smartcareStore.getNotifications());
    };
    update();
    const unsub = smartcareStore.subscribe(update);

    const handleAutoFill = (e: any) => {
      if (e.detail?.otp) {
        setSecondFactorValue(e.detail.otp);
      }
    };
    window.addEventListener('phone-otp-autofill', handleAutoFill);

    return () => {
      unsub();
      window.removeEventListener('phone-otp-autofill', handleAutoFill);
    };
  }, []);

  const handleProcessCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInMessage(null);
    const result = smartcareStore.checkInPatient(checkInToken, secondFactorType, secondFactorValue);
    if (result.success) {
      setCheckInMessage({ text: result.message, type: 'success' });
      if (result.entry) {
        setPrintTokenModal(result.entry);
      }
    } else {
      setCheckInMessage({ text: result.message, type: 'error' });
    }
  };

  const handleSkipConfirm = () => {
    if (!skipModal) return;
    smartcareStore.markSkipped(skipModal.id, skipReason);
    setSkipModal(null);
  };

  const handleApproveRejoin = (entry: QueueEntry) => {
    smartcareStore.approveRejoin(entry.id);
  };

  const handleOverrideSubmit = () => {
    if (!overrideModal || !overrideReason.trim()) {
      alert('Mandatory override reason required for healthcare audit!');
      return;
    }
    // Update queue priority
    overrideModal.priorityLevel = overridePriority;
    overrideModal.priorityReason = overrideReason;
    smartcareStore.logAudit('Meera Nair', 'RECEPTIONIST', 'MANUAL_QUEUE_OVERRIDE', 'QueueEntry', overrideModal.tokenNumber, `Priority set to ${overridePriority}: ${overrideReason}`);
    setOverrideModal(null);
  };

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageReason.trim()) {
      alert('Mandatory clinical reason is required for priority override.');
      return;
    }
    const newEntry = smartcareStore.applyTriageOverride(triagePatientId, triagePriority, triageReason, triageDoctorId);
    setTriageNotice(`Priority override registered: Token ${newEntry.tokenNumber} placed at top of active queue.`);
    setTimeout(() => setTriageNotice(null), 5000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              {getLocalized('Reception & Patient Check-In', 'வரவேற்பு & நோயாளி வருகை பதிவு', 'रिसेप्शन और मरीज चेक-इन')}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              background: '#ede9fe',
              color: '#6d28d9',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
            }}>
              FRONT DESK
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {getLocalized(
              'QR code verification, 2FA arrival validation, token print fallback, and queue priority controls.',
              'QR ஸ்கேன், 2-படி சரிபார்ப்பு, டோக்கன் அச்சிடுதல் மற்றும் வரிசை மேலாண்மை',
              'क्यूआर कोड सत्यापन, 2FA आगमन सत्यापन, टोकन प्रिंट और कतार प्राथमिकता नियंत्रण।'
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('CHECKIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: activeTab === 'CHECKIN' ? 'var(--primary)' : '#ffffff',
              color: activeTab === 'CHECKIN' ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <QrCode size={16} />
            <span>QR & OTP Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('QUEUE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: activeTab === 'QUEUE' ? 'var(--primary)' : '#ffffff',
              color: activeTab === 'QUEUE' ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Clock size={16} />
            <span>Live Queue Monitor ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRIAGE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: activeTab === 'TRIAGE' ? '#ef4444' : '#ffffff',
              color: activeTab === 'TRIAGE' ? '#ffffff' : '#b91c1c',
              border: '1px solid #fca5a5',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ShieldAlert size={16} />
            <span>Emergency / Triage Priority</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: activeTab === 'NOTIFICATIONS' ? 'var(--primary)' : '#ffffff',
              color: activeTab === 'NOTIFICATIONS' ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <MessageSquare size={16} />
            <span>Notification Delivery</span>
          </button>
        </div>
      </div>

      {/* TAB 1: QR & OTP CHECK-IN */}
      {activeTab === 'CHECKIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Check-In Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <QrCode size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                  Patient Arrival Verification (வருகை உறுதிப்படுத்தல்)
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Single-use cryptographic pass check + Second-factor identity authentication
                </div>
              </div>
            </div>

            {checkInMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: checkInMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${checkInMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: checkInMessage.type === 'success' ? '#166534' : '#b91c1c',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}>
                {checkInMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{checkInMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProcessCheckIn}>
              {/* Token or QR input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                  STEP 1: TOKEN / BOOKING REFERENCE / SCANNED QR
                </label>
                <input
                  type="text"
                  value={checkInToken}
                  onChange={(e) => setCheckInToken(e.target.value)}
                  placeholder="e.g. A-107 or BK-SC-102938"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Available booked tokens today: A-107 (Karthikeyan Ram), A-108 (Priya Dharshini), A-109 (Saravanan Bala)
                </div>
              </div>

              {/* Second factor selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                  STEP 2: SECOND VERIFICATION FACTOR (2FA)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => { setSecondFactorType('OTP'); setSecondFactorValue('123456'); }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: secondFactorType === 'OTP' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                      background: secondFactorType === 'OTP' ? 'var(--primary-bg)' : '#ffffff',
                      color: secondFactorType === 'OTP' ? 'var(--primary-dark)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mobile OTP (123456)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSecondFactorType('DOB'); setSecondFactorValue('1982-05-18'); }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: secondFactorType === 'DOB' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                      background: secondFactorType === 'DOB' ? 'var(--primary-bg)' : '#ffffff',
                      color: secondFactorType === 'DOB' ? 'var(--primary-dark)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Date of Birth (YYYY-MM-DD)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSecondFactorType('PHONE_LAST_4'); setSecondFactorValue('3458'); }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: secondFactorType === 'PHONE_LAST_4' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                      background: secondFactorType === 'PHONE_LAST_4' ? 'var(--primary-bg)' : '#ffffff',
                      color: secondFactorType === 'PHONE_LAST_4' ? 'var(--primary-dark)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Last 4 Digits Phone
                  </button>
                </div>

                <input
                  type="text"
                  value={secondFactorValue}
                  onChange={(e) => setSecondFactorValue(e.target.value)}
                  placeholder="Enter verification value..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
                {secondFactorType === 'OTP' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const entry = queue.find(q => q.tokenNumber.toUpperCase() === checkInToken.trim().toUpperCase());
                        const p = entry ? patients.find(pt => pt.id === entry.patientId) : null;
                        const phone = p?.phone || '9840123450';
                        phoneOtpService.sendOtp(phone);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Smartphone size={13} />
                      <span>{getLocalized('Send OTP to Patient Phone Message', 'போனுக்கு OTP அனுப்புக', 'मरीज के फोन संदेश पर ओटीपी भेजें')}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: 'var(--primary-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                }}
              >
                <CheckCircle2 size={18} />
                <span>Validate & Move to Active Queue (வருகை உறுதிசெய்)</span>
              </button>
            </form>
          </div>

          {/* Quick Simulation Scanner Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
                Reception QR Scanner Simulation
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Simulate a patient walking up to the counter and scanning their mobile digital QR pass.
              </p>

              <div style={{
                margin: '1.5rem auto',
                width: '160px',
                height: '160px',
                border: '2px dashed var(--primary)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--primary-bg)',
                color: 'var(--primary-dark)',
              }}>
                <QrCode size={64} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  Scanner Active
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                • Replay Protection Active: QR tokens can only be used once for arrival.<br />
                • No PHI inside QR payload: only short-lived signed tokens.<br />
                • Automatic failover to mobile OTP or receptionist manual override.
              </div>
            </div>

            <button
              onClick={() => {
                setCheckInToken('A-108');
                setSecondFactorType('OTP');
                setSecondFactorValue('123456');
              }}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Simulate Scan: Priya Dharshini (A-108)
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE QUEUE MONITOR & ACTIONS */}
      {activeTab === 'QUEUE' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Live Digital Queue Board (நேரலை வரிசை மேலாண்மை)
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {queue.length} Total Registered Outpatients Today
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Token</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Patient Details</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Doctor & Room</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Arrival / Joined</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Est. Wait</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 650, textAlign: 'right' }}>Front Desk Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: entry.priorityLevel === 'EMERGENCY' ? '#ef4444' : 'var(--text-heading)',
                    }}>
                      {entry.tokenNumber}
                    </span>
                    {entry.priorityLevel !== 'NORMAL' && (
                      <span style={{
                        marginLeft: '0.4rem',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        background: entry.priorityLevel === 'EMERGENCY' ? '#ef4444' : '#f59e0b',
                        color: '#fff',
                      }}>
                        {entry.priorityLevel}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{entry.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.patientAge}y • {entry.patientGender}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{entry.doctorName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.roomNumber} • {entry.department}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={
                      entry.queueStatus === 'IN_CONSULTATION' ? 'chip-verified' :
                      entry.queueStatus === 'CALLED' ? 'chip-waiting' :
                      entry.queueStatus === 'SKIPPED' ? 'chip-emergency' : 'chip-dpdp-ledger'
                    }>
                      {entry.queueStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {entry.joinedQueueAt}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    ~{entry.estimatedWaitMinutes} mins
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setPrintTokenModal(entry)}
                        title="Print Token Slip Fallback"
                        style={{
                          padding: '0.35rem 0.6rem',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        <Printer size={13} />
                        <span>Print</span>
                      </button>

                      {entry.queueStatus === 'CALLED' && (
                        <button
                          onClick={() => setSkipModal(entry)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          Skip
                        </button>
                      )}

                      {entry.queueStatus === 'SKIPPED' && (
                        <button
                          onClick={() => handleApproveRejoin(entry)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            background: '#dcfce7',
                            border: '1px solid #86efac',
                            borderRadius: '6px',
                            color: '#166534',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          Approve Rejoin
                        </button>
                      )}

                      <button
                        onClick={() => { setOverrideModal(entry); setOverrideReason(''); }}
                        style={{
                          padding: '0.35rem 0.6rem',
                          background: '#fff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        Priority Override
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: EMERGENCY & TRIAGE PRIORITY */}
      {activeTab === 'TRIAGE' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Clinical Emergency Priority Override (அவசர முன்னுரிமை)
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Authorized healthcare staff priority assignment. Audited with mandatory clinical reason.
              </div>
            </div>
          </div>

          {triageNotice && (
            <div style={{ padding: '0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              ✓ {triageNotice}
            </div>
          )}

          <form onSubmit={handleTriageSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                SELECT PATIENT
              </label>
              <select
                value={triagePatientId}
                onChange={(e) => setTriagePatientId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y, {p.gender}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                ASSIGNING DOCTOR / DEPARTMENT
              </label>
              <select
                value={triageDoctorId}
                onChange={(e) => setTriageDoctorId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty} — {d.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                PRIORITY LEVEL
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setTriagePriority('EMERGENCY')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: triagePriority === 'EMERGENCY' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    background: triagePriority === 'EMERGENCY' ? '#fef2f2' : '#fff',
                    color: triagePriority === 'EMERGENCY' ? '#b91c1c' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  EMERGENCY (Immediate Front of Queue)
                </button>
                <button
                  type="button"
                  onClick={() => setTriagePriority('HIGH_PRIORITY')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: triagePriority === 'HIGH_PRIORITY' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: triagePriority === 'HIGH_PRIORITY' ? '#fffbeb' : '#fff',
                    color: triagePriority === 'HIGH_PRIORITY' ? '#b45309' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  HIGH PRIORITY (Next Available)
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                MANDATORY CLINICAL REASON (மருத்துவ அவசர விளக்கம்)
              </label>
              <textarea
                rows={3}
                value={triageReason}
                onChange={(e) => setTriageReason(e.target.value)}
                placeholder="State clinical symptoms, vital instability, acute distress..."
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
              <div style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '0.3rem' }}>
                * Logged in immutable hospital audit trail with staff ID and timestamp.
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.9rem',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldAlert size={18} />
              <span>Apply Emergency Priority Override</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: NOTIFICATION DELIVERY STATUS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Patient Notification Dispatch Stream
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Multi-channel delivery status (WhatsApp → SMS fallback → In-App). Minimum PHI compliance.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: n.channel === 'WHATSAPP' ? '#dcfce7' : '#eff6ff',
                      color: n.channel === 'WHATSAPP' ? '#166534' : '#1e40af',
                    }}>
                      {n.channel}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      To: +91-{n.patientPhone}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {n.timestamp}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {n.messagePreview}
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}>
                  {n.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINT FALLBACK TOKEN MODAL */}
      {printTokenModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '380px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #cbd5e1',
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
                SMARTCARE MEDICAL CENTRE
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Kovilpatti, Tamil Nadu • Ph: 04632-220000
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.4rem' }}>
                OUTPATIENT ARRIVAL PASS
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                YOUR TOKEN NUMBER
              </div>
              <div style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-heading)',
                lineHeight: 1,
                margin: '0.5rem 0',
              }}>
                {printTokenModal.tokenNumber}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '0.3rem 1rem',
                borderRadius: '8px',
                display: 'inline-block',
              }}>
                {printTokenModal.roomNumber}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Patient:</span>
                <span style={{ fontWeight: 700 }}>{printTokenModal.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Doctor:</span>
                <span style={{ fontWeight: 700 }}>{printTokenModal.doctorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dept:</span>
                <span style={{ fontWeight: 700 }}>{printTokenModal.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <span style={{ fontWeight: 700 }}>{new Date().toLocaleDateString('en-GB')} {printTokenModal.joinedQueueAt}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Please observe the Waiting Hall Display. When your token is called, proceed to {printTokenModal.roomNumber}.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setPrintTokenModal(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                Close
              </button>

              <button
                onClick={() => {
                  window.print();
                  setPrintTokenModal(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={16} />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKIP CONFIRMATION MODAL */}
      {skipModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
              Confirm Skipping Token #{skipModal.tokenNumber}?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Patient <strong>{skipModal.patientName}</strong> did not respond to call.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                REASON FOR SKIPPING
              </label>
              <input
                type="text"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSkipModal(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSkipConfirm}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIORITY OVERRIDE MODAL */}
      {overrideModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
              Manual Queue Priority Override: {overrideModal.tokenNumber}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Change queue priority for <strong>{overrideModal.patientName}</strong>
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                PRIORITY LEVEL
              </label>
              <select
                value={overridePriority}
                onChange={(e) => setOverridePriority(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="HIGH_PRIORITY">High Priority (Urgent Clinical Call)</option>
                <option value="EMERGENCY">Emergency Priority (Immediate Front)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                MANDATORY CLINICAL REASON *
              </label>
              <input
                type="text"
                placeholder="e.g. Elderly patient with acute dizziness"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setOverrideModal(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#0d9488', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
