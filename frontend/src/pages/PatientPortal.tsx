import React, { useState, useEffect } from 'react';
import { 
  smartcareStore, 
  Patient, 
  Doctor, 
  QueueEntry, 
  Prescription, 
  Appointment,
  NotificationItem 
} from '../api/smartcareStore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  Download, 
  ArrowRight, 
  Volume2, 
  RotateCcw, 
  X, 
  Building2, 
  Stethoscope, 
  Phone, 
  Mail, 
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'BOOK' | 'PRESCRIPTIONS' | 'CONSENT'>('QUEUE');

  // Queue state for this patient
  const [patientQueueEntry, setPatientQueueEntry] = useState<QueueEntry | null>(null);
  const [currentServingToken, setCurrentServingToken] = useState<string>('A-101');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Booking Form State
  const [selectedDept, setSelectedDept] = useState('General Medicine');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [bookingDate, setBookingDate] = useState('2026-10-09');
  const [bookingSlot, setBookingSlot] = useState('10:30 AM');
  const [paymentOption, setPaymentOption] = useState<'PAY_AT_CLINIC' | 'PAID_ONLINE'>('PAY_AT_CLINIC');
  const [bookingSuccessModal, setBookingSuccessModal] = useState<{ appointment: Appointment; queueEntry: QueueEntry } | null>(null);

  // Secure Prescription Viewer Modal
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);
  const [rxVerified, setRxVerified] = useState(false);
  const [rxVerificationInput, setRxVerificationInput] = useState('');
  const [rxVerificationError, setRxVerificationError] = useState('');

  // Reschedule / Cancel Modal
  const [cancelModal, setCancelModal] = useState<QueueEntry | null>(null);
  const [cancelReason, setCancelReason] = useState('Personal scheduling conflict');

  // Consent settings
  const [consentState, setConsentState] = useState({
    appointmentCommunication: true,
    queueNotifications: true,
    messagingChannels: true,
    prescriptionDelivery: true,
    pharmacySharing: true,
  });
  const [consentSavedNotice, setConsentSavedNotice] = useState(false);

  useEffect(() => {
    const update = () => {
      // Find patient matching current user
      const pts = smartcareStore.getPatients();
      const matched = pts.find(p => p.userId === user?.userId || p.phone === user?.phone) || pts[0];
      setPatient(matched);
      setConsentState(matched.consent);

      const docs = smartcareStore.getDoctors();
      setDoctors(docs);

      const activeQ = smartcareStore.getActiveQueueSorted();
      const serving = activeQ.find(q => q.queueStatus === 'IN_CONSULTATION') || activeQ.find(q => q.queueStatus === 'CALLED');
      if (serving) setCurrentServingToken(serving.tokenNumber);

      const myEntry = activeQ.find(q => q.patientId === matched.id) || smartcareStore.getQueue().find(q => q.patientId === matched.id);
      setPatientQueueEntry(myEntry || null);
    };

    update();
    const unsub = smartcareStore.subscribe(update);
    return () => unsub();
  }, [user]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const result = smartcareStore.bookAppointment({
      patientId: patient.id,
      doctorId: selectedDoctorId,
      date: bookingDate,
      timeSlot: bookingSlot,
      paymentMethod: paymentOption,
    });

    setBookingSuccessModal(result);
    setActiveTab('QUEUE');
  };

  const handleSaveConsent = () => {
    if (!patient) return;
    smartcareStore.updatePatientConsent(patient.id, consentState);
    setConsentSavedNotice(true);
    setTimeout(() => setConsentSavedNotice(false), 3000);
  };

  const handleOpenRx = (rx: Prescription) => {
    setViewingRx(rx);
    setRxVerified(false);
    setRxVerificationInput('');
    setRxVerificationError('');
  };

  const handleVerifyRxIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    // Verify against last 4 digits of phone or birth year
    if (patient.phone.endsWith(rxVerificationInput.trim()) || patient.dob.includes(rxVerificationInput.trim())) {
      setRxVerified(true);
      setRxVerificationError('');
      smartcareStore.logAudit(patient.name, 'PATIENT', 'PRESCRIPTION_VIEWED', 'Prescription', viewingRx?.prescriptionNumber || '', 'Patient authenticated 2FA and opened prescription view.');
    } else {
      setRxVerificationError('Verification failed. Please enter the last 4 digits of your verified mobile number.');
      smartcareStore.logSecurity('LOW', 'PRESCRIPTION_2FA_FAIL', `Failed identity check for Rx #${viewingRx?.prescriptionNumber}`);
    }
  };

  const handleCancelAppointment = () => {
    if (!patientQueueEntry) return;
    patientQueueEntry.queueStatus = 'SKIPPED';
    smartcareStore.logAudit(patient?.name || 'Patient', 'PATIENT', 'APPOINTMENT_CANCELLED', 'QueueEntry', patientQueueEntry.tokenNumber, `Cancelled by patient: ${cancelReason}`);
    setCancelModal(null);
  };

  const myPrescriptions = smartcareStore.getPrescriptionsForPatient(patient?.id || 1);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Patient Welcome Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        marginBottom: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
          }}>
            {patient?.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {patient?.name}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: '#dcfce7',
                color: '#166534',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
              }}>
                ✓ OTP VERIFIED
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Patient ID: #{patient?.id} • +91-{patient?.phone} • {patient?.age} yrs, {patient?.gender} • Blood Group: {patient?.bloodGroup}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('BOOK')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '8px',
              background: 'var(--primary-gradient)',
              color: '#fff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Calendar size={15} />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '1.75rem',
      }}>
        <button
          onClick={() => setActiveTab('QUEUE')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'QUEUE' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'QUEUE' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'QUEUE' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Clock size={16} />
          <span>Live Queue & Token Status</span>
        </button>

        <button
          onClick={() => setActiveTab('BOOK')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'BOOK' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'BOOK' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'BOOK' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Calendar size={16} />
          <span>Doctor Booking & Slots</span>
        </button>

        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'PRESCRIPTIONS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'PRESCRIPTIONS' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'PRESCRIPTIONS' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <FileText size={16} />
          <span>Secure Digital Prescriptions ({myPrescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONSENT')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'CONSENT' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'CONSENT' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'CONSENT' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <ShieldCheck size={16} />
          <span>Consent & Privacy Preferences</span>
        </button>
      </div>

      {/* TAB 1: LIVE QUEUE & TOKEN STATUS */}
      {activeTab === 'QUEUE' && (
        <div>
          {/* YOU ARE NEXT / CALLED PROMINENT ALERT */}
          {patientQueueEntry?.queueStatus === 'CALLED' && (
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
              animation: 'pulse 2s infinite',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                  🔔 YOU HAVE BEEN CALLED — தயவுசெய்து மருத்துவரிடம் செல்லவும்
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, margin: '0.3rem 0' }}>
                  Proceed to {patientQueueEntry.roomNumber} ({patientQueueEntry.doctorName})
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  Your token <strong>{patientQueueEntry.tokenNumber}</strong> is active. Please enter the doctor's room immediately.
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>CALL WINDOW</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                  {patientQueueEntry.responseTimerSeconds || 180}s
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
            {/* Left: Token Card & Timeline */}
            <div 
              className="queue-card-strip-sapphire"
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '2rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    YOUR ACTIVE PASS & QUEUE POSITION
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0.2rem 0' }}>
                    SmartCare Medical Centre, Kovilpatti
                  </h3>
                </div>

                {patientQueueEntry && (
                  <span className={patientQueueEntry.queueStatus === 'CALLED' ? 'chip-verified' : 'chip-waiting'}>
                    {patientQueueEntry.queueStatus}
                  </span>
                )}
              </div>

              {/* Big Token Number Display */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.75rem',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    YOUR TOKEN (உங்கள் டோக்கன்)
                  </div>
                  <div style={{
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--primary-dark)',
                    lineHeight: 1.1,
                    margin: '0.4rem 0',
                  }}>
                    {patientQueueEntry?.tokenNumber || 'A-101'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {patientQueueEntry?.roomNumber || 'Room 101'} • {patientQueueEntry?.doctorName || 'Dr. Arun Kumar'}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    CURRENTLY SERVING (தற்போது அழைப்பு)
                  </div>
                  <div style={{
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--text-heading)',
                    lineHeight: 1.1,
                    margin: '0.4rem 0',
                  }}>
                    {currentServingToken}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--green-dark, #059669)', fontWeight: 700 }}>
                    Doctor Consultation In Progress
                  </div>
                </div>
              </div>

              {/* Queue Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f1f5f9', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PATIENTS AHEAD</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {patientQueueEntry?.queueStatus === 'CALLED' ? 0 : 2}
                  </div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ESTIMATED WAIT</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {patientQueueEntry?.queueStatus === 'CALLED' ? '0 mins' : '~15 mins'}
                  </div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DOCTOR STATUS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>
                    AVAILABLE
                  </div>
                </div>
              </div>

              {/* Live Timeline Step Indicator */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem' }}>
                  JOURNEY TIMELINE (வருகை நிலை):
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {[
                    { label: 'Checked In', status: 'done', desc: 'Verified 2FA' },
                    { label: 'Waiting', status: 'done', desc: 'In digital queue' },
                    { label: 'Called', status: patientQueueEntry?.queueStatus === 'CALLED' ? 'active' : 'pending', desc: 'Proceed to room' },
                    { label: 'Consultation', status: 'pending', desc: 'Doctor eval' },
                    { label: 'Completed', status: 'pending', desc: 'Digital Rx ready' },
                  ].map((step, idx) => (
                    <div key={idx} style={{ textAlign: 'center', zIndex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: step.status === 'done' ? '#0d9488' : step.status === 'active' ? '#3b82f6' : '#e2e8f0',
                        color: step.status === 'pending' ? '#64748b' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.4rem',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}>
                        {step.status === 'done' ? '✓' : idx + 1}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel / Reschedule Flow buttons */}
              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setCancelModal(patientQueueEntry)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Appointment
                </button>
              </div>
            </div>

            {/* Right: Secure Digital QR Pass Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SINGLE-USE SECURE PASS
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0.2rem 0 1rem 0' }}>
                Check-In QR Pass
              </h4>

              {/* QR Code Frame */}
              <div style={{
                width: '180px',
                height: '180px',
                padding: '1rem',
                border: '2px solid var(--primary-border)',
                borderRadius: '16px',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <QrCode size={120} color="var(--primary-dark)" />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
                  sc_sec_8f4a9b2c...
                </div>
              </div>

              <div style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}>
                Expires in 14 mins (Arrival Window)
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, textAlign: 'left', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-heading)' }}>Security & Privacy Guarantee:</div>
                • No names, phone numbers, or health data encoded in QR.<br />
                • Single-use validation at reception terminal / kiosk.<br />
                • Replay attempts automatically rejected.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR BOOKING & SLOTS */}
      {activeTab === 'BOOK' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.3rem' }}>
            Book Outpatient Appointment (மருத்துவ முன்பதிவு)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            SmartCare Medical Centre, Kovilpatti • Guaranteed slot allocation with digital token
          </p>

          <form onSubmit={handleBookAppointment}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  DEPARTMENT (பிரிவு)
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option>General Medicine</option>
                  <option>Dermatology</option>
                  <option>Paediatrics</option>
                  <option>Dental</option>
                  <option>Orthopaedics</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  DOCTOR (மருத்துவர்)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty} ({d.qualification})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  APPOINTMENT DATE (தேதி)
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                  AVAILABLE TIME SLOT (நேரம்)
                </label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option>09:30 AM (Available)</option>
                  <option>10:00 AM (Available)</option>
                  <option>10:30 AM (Available)</option>
                  <option>11:00 AM (Available)</option>
                  <option>11:30 AM (Available)</option>
                  <option>04:30 PM (Available)</option>
                  <option>05:00 PM (Available)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                PAYMENT SIMULATION METHOD
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentOption('PAY_AT_CLINIC')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: paymentOption === 'PAY_AT_CLINIC' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                    background: paymentOption === 'PAY_AT_CLINIC' ? 'var(--primary-bg)' : '#fff',
                    color: paymentOption === 'PAY_AT_CLINIC' ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Pay at Clinic (Front Desk)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('PAID_ONLINE')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: paymentOption === 'PAID_ONLINE' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                    background: paymentOption === 'PAID_ONLINE' ? 'var(--primary-bg)' : '#fff',
                    color: paymentOption === 'PAID_ONLINE' ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Online Payment Confirmed (Simulated)
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.9rem',
                background: 'var(--primary-gradient)',
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
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Confirm Appointment & Generate Digital Pass</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SECURE DIGITAL PRESCRIPTIONS */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Your Secure Prescriptions (பாதுகாப்பான மருந்து சீட்டு)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Digitally signed by authorized medical practitioners. Identity authentication required to view.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myPrescriptions.map(rx => (
              <div
                key={rx.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                      {rx.doctorName}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      SIGNED v{rx.version}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {rx.prescriptionNumber}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Diagnosis: {rx.diagnosis}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Issued on {rx.issuedAt} • {rx.medicines.length} medications • Expiry: 14 days
                  </div>
                </div>

                <button
                  onClick={() => handleOpenRx(rx)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Lock size={14} />
                  <span>View Prescription (2FA)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONSENT & NOTIFICATION PREFERENCES */}
      {activeTab === 'CONSENT' && (
        <div style={{ maxWidth: '720px', margin: '0 auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Patient Consent & Privacy Governance (ஒப்புதல் மேலாண்மை)
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Granular consent management. You may withdraw optional communication at any time.
              </div>
            </div>
          </div>

          {consentSavedNotice && (
            <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              ✓ Consent preferences updated successfully and logged in audit trail.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { key: 'appointmentCommunication', title: '1. Appointment Communication', desc: 'Direct booking updates, schedule delays, and arrival reminders.' },
              { key: 'queueNotifications', title: '2. Live Queue Calling Alerts', desc: 'Real-time alert when your token is called to proceed to consultation room.' },
              { key: 'messagingChannels', title: '3. WhatsApp / SMS Delivery', desc: 'Receive secure links and token confirmation via WhatsApp or SMS message.' },
              { key: 'prescriptionDelivery', title: '4. Secure Digital Prescription Delivery', desc: 'Allow generation of encrypted access link for your consultation document.' },
              { key: 'pharmacySharing', title: '5. Optional Pharmacy Sharing', desc: 'Allow in-house clinic pharmacy to view verified prescription for dispensing.' },
            ].map(item => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={(consentState as any)[item.key]}
                  onChange={(e) => setConsentState({ ...consentState, [item.key]: e.target.checked })}
                  style={{ marginTop: '0.2rem', transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveConsent}
            style={{
              padding: '0.8rem 1.5rem',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Save Consent Preferences
          </button>
        </div>
      )}

      {/* SECURE PRESCRIPTION 2FA & VIEWER MODAL */}
      {viewingRx && (
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
          {!rxVerified ? (
            /* Step 1: 2FA Identity Verification */
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <Lock size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                  Verify Identity to Access Medical Record
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
                  For healthcare privacy compliance, confirm your identity before viewing clinical document #{viewingRx.prescriptionNumber}.
                </p>
              </div>

              {rxVerificationError && (
                <div style={{ padding: '0.6rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.78rem', marginBottom: '1rem' }}>
                  {rxVerificationError}
                </div>
              )}

              <form onSubmit={handleVerifyRxIdentity}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                    ENTER LAST 4 DIGITS OF VERIFIED MOBILE NUMBER OR BIRTH YEAR
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. 3450"
                    value={rxVerificationInput}
                    onChange={(e) => setRxVerificationInput(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '0.2em', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Hint: Mobile ending digits for Vikram Malhotra is 3450
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setViewingRx(null)}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Authenticate & View
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Step 2: Polished Printable Digital Prescription Slip */
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0d9488', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-heading)', margin: 0 }}>
                    SMARTCARE MEDICAL CENTRE
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Kovilpatti, Tamil Nadu • Clinical Outpatient Department
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.2rem' }}>
                    {viewingRx.doctorName} • {viewingRx.doctorQualification}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Medical Registration No: {viewingRx.doctorRegistrationNumber}
                  </div>
                </div>

                <button onClick={() => setViewingRx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Patient Meta Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <div>
                  <div><strong>Patient:</strong> {viewingRx.patientName}</div>
                  <div><strong>Age / Gender:</strong> {viewingRx.patientAge}y / {viewingRx.patientGender}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Rx Number:</strong> {viewingRx.prescriptionNumber}</div>
                  <div><strong>Date:</strong> {viewingRx.issuedAt}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PROVISIONAL DIAGNOSIS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading)' }}>{viewingRx.diagnosis}</div>
              </div>

              {/* Medicines Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                  PRESCRIBED MEDICINES (Rx)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Medicine & Form</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Dosage & Frequency</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Days</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingRx.medicines.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 700 }}>{m.name} ({m.strength})</td>
                        <td style={{ padding: '0.5rem' }}>{m.frequency}</td>
                        <td style={{ padding: '0.5rem' }}>{m.durationDays}d</td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clinical Advice & Follow-Up */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <div><strong>Clinical Notes:</strong> {viewingRx.clinicalNotes}</div>
                {viewingRx.followUpDate && <div style={{ marginTop: '0.3rem' }}><strong>Follow-Up Date:</strong> {viewingRx.followUpDate}</div>}
              </div>

              {/* Digital Signature Box */}
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CRYPTOGRAPHIC VERIFICATION STAMP</div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-dark)' }}>
                    {viewingRx.doctorDigitalSignature.substring(0, 38)}...
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, marginTop: '0.2rem' }}>
                    ✓ Digitally Signed & Sealed by Medical Council Practitioner
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{viewingRx.doctorName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reg: {viewingRx.doctorRegistrationNumber}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setViewingRx(null)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Close Viewer
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Download size={16} />
                  <span>Download / Print Prescription PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOOKING SUCCESS MODAL */}
      {bookingSuccessModal && (
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
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Appointment Confirmed!
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.35rem 0 1.25rem 0' }}>
              Your digital token and secure QR pass have been generated.
            </p>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>YOUR ASSIGNED TOKEN</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary-dark)', margin: '0.2rem 0' }}>
                {bookingSuccessModal.queueEntry.tokenNumber}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {bookingSuccessModal.appointment.doctorName} ({bookingSuccessModal.appointment.department})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {bookingSuccessModal.appointment.date} at {bookingSuccessModal.appointment.timeSlot}
              </div>
            </div>

            <button
              onClick={() => setBookingSuccessModal(null)}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Go to Live Queue
            </button>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModal && (
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
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
              Cancel Appointment #{cancelModal.tokenNumber}?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Are you sure you wish to cancel this appointment? Your slot will be released for waiting patients.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                REASON FOR CANCELLATION
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCancelModal(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
