import React, { useState, useEffect } from 'react';
import { smartcareStore, Doctor, QueueEntry, Prescription, PrescriptionMedicine } from '../api/smartcareStore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Stethoscope, 
  Users, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  Volume2, 
  UserCheck, 
  Pause, 
  AlertCircle,
  Pill,
  Lock,
  ArrowRight,
  RotateCcw,
  Bell,
  Send,
  Check,
  X
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'CONSULTATION' | 'HISTORY'>('QUEUE');

  // Currently consulted queue entry
  const [currentPatientEntry, setCurrentPatientEntry] = useState<QueueEntry | null>(null);
  const [patientConfirmed, setPatientConfirmed] = useState(false);

  // Consultation Form
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-10-15');

  // Prescription builder state
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'm1',
      name: 'Paracetamol',
      formulation: 'Tablet',
      strength: '650 mg',
      dose: '1 tablet',
      frequency: '1-0-1 (After Food)',
      durationDays: 5,
      route: 'Oral',
      instructions: 'Take after meals for fever / body ache.',
    }
  ]);

  // Safety Warnings & Override
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Complete Encounter & Call Next Feature State
  const [noPrescriptionRequired, setNoPrescriptionRequired] = useState(false);
  const [noPrescriptionReason, setNoPrescriptionReason] = useState('Clinical counseling, hydration guidelines, and lifestyle observation only');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [nextEligiblePreview, setNextEligiblePreview] = useState<QueueEntry | null>(null);
  const [isSubmittingEncounter, setIsSubmittingEncounter] = useState(false);

  // Completed Rx History
  const [completedPrescriptions, setCompletedPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const update = () => {
      const doc = smartcareStore.getDoctors().find(d => d.id === (user?.doctorId || 1)) || smartcareStore.getDoctors()[0];
      setDoctor(doc);
      const q = smartcareStore.getActiveQueueSorted(doc.id);
      setQueue(q);

      // Find in consultation or called
      const inConsult = q.find(entry => entry.queueStatus === 'IN_CONSULTATION');
      if (inConsult) {
        setCurrentPatientEntry(inConsult);
      }
      setCompletedPrescriptions(smartcareStore.getPrescriptions().filter(p => p.doctorId === doc.id));
    };

    update();
    const unsub = smartcareStore.subscribe(update);
    return () => unsub();
  }, [user]);

  // Check safety warnings whenever medicines or patient changes
  useEffect(() => {
    if (!currentPatientEntry) {
      setSafetyWarnings([]);
      return;
    }
    const patient = smartcareStore.getPatientById(currentPatientEntry.patientId);
    const warnings: string[] = [];

    if (patient && patient.allergies.length > 0) {
      medicines.forEach(m => {
        patient.allergies.forEach(allergy => {
          if (m.name.toLowerCase().includes(allergy.toLowerCase()) || 
             (allergy.toLowerCase().includes('penicillin') && (m.name.toLowerCase().includes('amoxicillin') || m.name.toLowerCase().includes('ampicillin')))) {
            warnings.push(`CRITICAL ALLERGY ALERT: Patient has documented allergy to "${allergy}", but "${m.name}" is prescribed.`);
          }
        });
      });
    }

    // Check duplicate medicines
    const names = medicines.map(m => m.name.toLowerCase().trim());
    const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
    if (duplicates.length > 0) {
      warnings.push(`DUPLICATE MEDICINE WARNING: "${duplicates[0]}" appears more than once in this prescription.`);
    }

    setSafetyWarnings(warnings);
  }, [medicines, currentPatientEntry]);

  const handleCallNext = () => {
    if (!doctor) return;
    const called = smartcareStore.callNextPatient(doctor.id);
    if (called) {
      setActionNotice(`Called Token #${called.tokenNumber} (${called.patientName}). Response timer running.`);
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      setActionNotice('No more waiting patients in queue for your station.');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleStartConsultation = (entry: QueueEntry) => {
    smartcareStore.startConsultation(entry.id);
    setCurrentPatientEntry(entry);
    setPatientConfirmed(false);
    setActiveTab('CONSULTATION');
    const p = smartcareStore.getPatientById(entry.patientId);
    if (p) {
      setChiefComplaint('Fever, headache, and body aches for 3 days');
      setDiagnosis('Acute Upper Respiratory Tract Infection (Provisional)');
      setClinicalNotes('Vitals stable. Throat mildly congested. Advised rest, oral fluids, and follow-up if fever persists.');
    }
  };

  const handleAddMedicine = () => {
    const newMed: PrescriptionMedicine = {
      id: `m_${Date.now()}`,
      name: 'Amoxicillin-Clavulanic Acid',
      formulation: 'Tablet',
      strength: '625 mg',
      dose: '1 tablet',
      frequency: '1-0-1 (After Food)',
      durationDays: 5,
      route: 'Oral',
      instructions: 'Complete full course with meals.',
    };
    setMedicines([...medicines, newMed]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, val: any) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const handleSignAndComplete = () => {
    if (!currentPatientEntry || !doctor) return;

    if (safetyWarnings.length > 0 && !overrideReason.trim()) {
      alert('Safety warnings detected! You must provide an Authorized Override Reason before digitally signing this prescription.');
      return;
    }

    // 1. Create prescription
    smartcareStore.createAndSignPrescription({
      patientId: currentPatientEntry.patientId,
      doctorId: doctor.id,
      chiefComplaint,
      diagnosis,
      clinicalNotes,
      followUpDate,
      medicines,
      safetyWarnings,
      overrideReason: safetyWarnings.length > 0 ? overrideReason : undefined,
    });

    // 2. Complete consultation in queue
    smartcareStore.completeConsultation(currentPatientEntry.id);

    setActionNotice(`Prescription signed & consultation completed for Token ${currentPatientEntry.tokenNumber}.`);
    setCurrentPatientEntry(null);
    setPatientConfirmed(false);
    setActiveTab('QUEUE');
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Feature: Precondition Validations for "Complete Encounter & Call Next"
  const isDoctorAvailable = doctor?.availability === 'AVAILABLE';
  const isPatientInConsultation = currentPatientEntry?.queueStatus === 'IN_CONSULTATION';
  const isConsultationNotesReady = Boolean(chiefComplaint.trim() && diagnosis.trim());
  const isPrescriptionReady = noPrescriptionRequired || (medicines.length > 0 && (safetyWarnings.length === 0 || overrideReason.trim().length > 0));

  const canCompleteAndCallNext = 
    Boolean(doctor) &&
    isDoctorAvailable &&
    isPatientInConsultation &&
    patientConfirmed &&
    isConsultationNotesReady &&
    isPrescriptionReady;

  const getMissingPreconditionReason = (): string | null => {
    if (!isDoctorAvailable) return language === 'ta' ? 'மருத்துவர் நிலை "AVAILABLE" ஆக இருக்க வேண்டும் (தாமதம் அல்லது இடைநிறுத்தம் அல்ல)' : 'Doctor status must be set to "AVAILABLE" (not Delayed or Paused)';
    if (!isPatientInConsultation) return language === 'ta' ? 'நோயாளி "IN CONSULTATION" நிலையில் இருக்க வேண்டும்' : 'Current patient must be in consultation';
    if (!patientConfirmed) return language === 'ta' ? 'நோயாளி அடையாளத்தை முதலில் உறுதிப்படுத்தவும் (Confirm ID)' : 'Please confirm patient identity first';
    if (!chiefComplaint.trim()) return language === 'ta' ? 'முதன்மை காரணத்தை உள்ளிடவும் (Chief Complaint)' : 'Please document Chief Complaint';
    if (!diagnosis.trim()) return language === 'ta' ? 'மருத்துவ நோயறிதலை உள்ளிடவும் (Diagnosis)' : 'Please document Clinical Diagnosis';
    if (!noPrescriptionRequired && medicines.length === 0) return language === 'ta' ? 'மருந்துகளை சேர்க்கவும் அல்லது "மருந்து தேவையில்லை" என்பதைத் தேர்வுசெய்யவும்' : 'Add at least one medicine or check "No prescription required"';
    if (!noPrescriptionRequired && safetyWarnings.length > 0 && !overrideReason.trim()) return language === 'ta' ? 'மருந்து பாதுகாப்பு எச்சரிக்கைக்கான மருத்துவ விளக்கத்தை உள்ளிடவும்' : 'Document authorized override reason for safety warnings';
    return null;
  };

  const handleOpenCompleteModal = () => {
    if (!doctor || !currentPatientEntry) return;

    const missingReason = getMissingPreconditionReason();
    if (missingReason) {
      alert(`Cannot Complete Encounter & Call Next:\n• ${missingReason}`);
      return;
    }

    const next = smartcareStore.getNextEligiblePatient(doctor.id);
    setNextEligiblePreview(next);
    setShowCompleteModal(true);
  };

  const handleConfirmCompleteAndCallNext = () => {
    if (!doctor || !currentPatientEntry || isSubmittingEncounter) return;
    setIsSubmittingEncounter(true);

    const idempotencyKey = `enc_${doctor.id}_${currentPatientEntry.id}_${Date.now()}`;

    const result = smartcareStore.completeEncounterAndCallNext({
      doctorId: doctor.id,
      queueEntryId: currentPatientEntry.id,
      prescriptionData: noPrescriptionRequired ? undefined : {
        chiefComplaint,
        diagnosis,
        clinicalNotes,
        followUpDate,
        medicines,
        safetyWarnings,
        overrideReason: safetyWarnings.length > 0 ? overrideReason : undefined,
      },
      noPrescriptionRequired,
      noPrescriptionReason: noPrescriptionRequired ? noPrescriptionReason : undefined,
      idempotencyKey,
    });

    setIsSubmittingEncounter(false);
    setShowCompleteModal(false);

    if (result.success) {
      setActionNotice(result.message);
      setCurrentPatientEntry(null);
      setPatientConfirmed(false);
      setNoPrescriptionRequired(false);
      setActiveTab('QUEUE');
      setTimeout(() => setActionNotice(null), 6000);
    } else {
      alert(result.message);
    }
  };

  const calledEntry = queue.find(q => q.queueStatus === 'CALLED');
  const inConsultEntry = queue.find(q => q.queueStatus === 'IN_CONSULTATION');
  const waitingEntries = queue.filter(q => q.queueStatus === 'WAITING');

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Top Doctor Profile Bar & Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        marginBottom: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {doctor?.name}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'var(--primary-bg)',
                color: 'var(--primary-dark)',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--primary-border)',
              }}>
                Reg: {doctor?.registrationNumber}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {doctor?.qualification} • {doctor?.department} • {doctor?.roomNumber}
            </div>
          </div>
        </div>

        {/* Availability Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Status:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f8fafc', padding: '0.3rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => doctor && smartcareStore.updateDoctorAvailability(doctor.id, 'AVAILABLE', 0)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: doctor?.availability === 'AVAILABLE' ? '#10b981' : 'transparent',
                color: doctor?.availability === 'AVAILABLE' ? '#fff' : '#64748b',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Available
            </button>
            <button
              onClick={() => doctor && smartcareStore.updateDoctorAvailability(doctor.id, 'DELAYED', 15)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: doctor?.availability === 'DELAYED' ? '#f59e0b' : 'transparent',
                color: doctor?.availability === 'DELAYED' ? '#fff' : '#64748b',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Delayed (+15m)
            </button>
            <button
              onClick={() => doctor && smartcareStore.updateDoctorAvailability(doctor.id, 'PAUSED', 0)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: doctor?.availability === 'PAUSED' ? '#64748b' : 'transparent',
                color: doctor?.availability === 'PAUSED' ? '#fff' : '#64748b',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Pause Queue
            </button>
          </div>

          {/* Protected Doctor-Only Quick Button: Complete Encounter & Call Next */}
          {currentPatientEntry && currentPatientEntry.queueStatus === 'IN_CONSULTATION' && (
            <button
              onClick={handleOpenCompleteModal}
              title={canCompleteAndCallNext ? 'Complete current encounter & advance queue' : (getMissingPreconditionReason() || undefined)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: canCompleteAndCallNext
                  ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                  : '#e2e8f0',
                color: canCompleteAndCallNext ? '#ffffff' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: canCompleteAndCallNext ? 'pointer' : 'not-allowed',
                boxShadow: canCompleteAndCallNext ? '0 4px 14px rgba(13, 148, 136, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Bell size={15} />
              <span>{language === 'ta' ? '🔔 ஆலோசனையை முடித்து அடுத்தவரை அழைக்கவும்' : '🔔 Complete Encounter & Call Next'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--primary-bg)',
          border: '1px solid var(--primary-border)',
          borderRadius: '10px',
          color: 'var(--primary-dark)',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
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
            gap: '0.5rem',
          }}
        >
          <Clock size={16} />
          <span>Active Patient Queue ({queue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONSULTATION')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'CONSULTATION' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'CONSULTATION' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'CONSULTATION' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={16} />
          <span>Consultation & Prescription Builder {currentPatientEntry && `(${currentPatientEntry.tokenNumber})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'HISTORY' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'HISTORY' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'HISTORY' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Completed Consultations ({completedPrescriptions.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE QUEUE */}
      {activeTab === 'QUEUE' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Call Next & Highlighted Active Tokens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Primary Action Button */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.75rem',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Next eligible token is ready based on clinical priority logic:
              </div>

              <button
                onClick={handleCallNext}
                disabled={doctor?.availability === 'PAUSED'}
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  cursor: doctor?.availability === 'PAUSED' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 6px 20px rgba(13, 148, 136, 0.3)',
                  letterSpacing: '0.02em',
                }}
              >
                <Volume2 size={22} />
                <span>Call Next Patient (அடுத்த நோயாளி)</span>
              </button>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Atomic Mutex Locked • Dispatches WhatsApp/SMS Notification • Starts 3-Minute Arrival Window
              </div>
            </div>

            {/* Currently Called Banner */}
            {calledEntry && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(13, 148, 136, 0.05) 100%)',
                border: '2px solid #3b82f6',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    PATIENT CALLED — AWAITING ARRIVAL
                  </span>
                  <div style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    Timer: {calledEntry.responseTimerSeconds || 180}s
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                      {calledEntry.tokenNumber}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {calledEntry.patientName} ({calledEntry.patientAge}y, {calledEntry.patientGender})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Called at {calledEntry.calledAt}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleStartConsultation(calledEntry)}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: '#0d9488',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <UserCheck size={16} />
                      <span>Arrived: Start Consult</span>
                    </button>

                    <button
                      onClick={() => smartcareStore.markSkipped(calledEntry.id, 'No show during 3m window')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        color: '#64748b',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Mark Skipped
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Currently In Consultation Banner */}
            {inConsultEntry && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #10b981',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                    IN ACTIVE CONSULTATION
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Token #{inConsultEntry.tokenNumber}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                      {inConsultEntry.patientName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {inConsultEntry.patientAge} yrs • {inConsultEntry.patientGender}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPatientEntry(inConsultEntry);
                      setActiveTab('CONSULTATION');
                    }}
                    style={{
                      padding: '0.6rem 1.25rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>Open Workspace</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Waiting Queue List */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                Waiting Patients List ({waitingEntries.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Earliest arrival priority
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '520px' }}>
              {waitingEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: entry.priorityLevel === 'EMERGENCY' ? '#fef2f2' : entry.priorityLevel === 'HIGH_PRIORITY' ? '#fffbeb' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: entry.priorityLevel === 'EMERGENCY' ? '#dc2626' : 'var(--text-heading)',
                      }}>
                        {entry.tokenNumber}
                      </span>
                      {entry.priorityLevel !== 'NORMAL' && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: entry.priorityLevel === 'EMERGENCY' ? '#ef4444' : '#f59e0b',
                          color: '#fff',
                        }}>
                          {entry.priorityLevel}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {entry.patientName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {entry.patientAge}y • {entry.patientGender} • Joined at {entry.joinedQueueAt}
                    </div>
                    {entry.priorityReason && (
                      <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600, marginTop: '0.2rem' }}>
                        Reason: {entry.priorityReason}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartConsultation(entry)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: 'var(--primary-dark)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Direct Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTATION & PRESCRIPTION WORKSPACE */}
      {activeTab === 'CONSULTATION' && (
        <div>
          {!currentPatientEntry ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}>
              <Stethoscope size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                No Active Patient Selected
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Please select a patient from the active queue or call the next token.
              </div>
              <button
                onClick={() => setActiveTab('QUEUE')}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Go to Queue
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem' }}>
              {/* Left Column: Patient Identity & Clinical Assessment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Patient Identity Card */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        CONFIRMED PATIENT IDENTITY
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0.2rem 0' }}>
                        {currentPatientEntry.patientName}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Token: {currentPatientEntry.tokenNumber} • Appointment ID: #{currentPatientEntry.appointmentId}
                      </div>
                    </div>

                    <div style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      background: patientConfirmed ? '#dcfce7' : '#fef3c7',
                      color: patientConfirmed ? '#166534' : '#92400e',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}>
                      {patientConfirmed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{patientConfirmed ? 'Verified In-Person' : 'Confirm ID'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AGE & GENDER</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentPatientEntry.patientAge}y / {currentPatientEntry.patientGender}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>BLOOD GROUP</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>B+</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LANGUAGE</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Tamil / English</div>
                    </div>
                  </div>

                  {/* ALLERGIES BADGES AREA */}
                  <div style={{
                    padding: '0.85rem',
                    background: '#fef2f2',
                    borderRadius: '10px',
                    border: '1px solid #fecaca',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b91c1c', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShieldAlert size={14} />
                      <span>DOCUMENTED ALLERGIES & DRUG SENSITIVITIES:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#dc2626',
                        color: '#fff',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        Penicillin Allergy
                      </span>
                      <span style={{
                        background: '#f87171',
                        color: '#fff',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        NSAIDs Sensitivity
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPatientConfirmed(true)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      background: patientConfirmed ? '#f1f5f9' : '#0d9488',
                      color: patientConfirmed ? '#475569' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {patientConfirmed ? '✓ Patient Identity Confirmed' : 'Confirm Patient Physical Identity'}
                  </button>
                </div>

                {/* Clinical Notes Form */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
                    Clinical Assessment
                  </h4>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      CHIEF COMPLAINT (முதன்மை பிரச்சனை)
                    </label>
                    <input
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      PROVISIONAL DIAGNOSIS
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      CLINICAL NOTES & ADVICE
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      RECOMMENDED FOLLOW-UP DATE
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Structured Prescription Builder & Digital Signature */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                      Structured Digital Prescription
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Physician-Authored Medication Order (மருந்து பட்டியல்)
                    </div>
                  </div>

                  <button
                    onClick={handleAddMedicine}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.45rem 0.85rem',
                      background: 'var(--primary-bg)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary-dark)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {/* NO PRESCRIPTION REQUIRED DOCUMENTATION OPTION */}
                <div style={{
                  padding: '0.85rem',
                  background: noPrescriptionRequired ? '#f0fdf4' : '#f8fafc',
                  border: noPrescriptionRequired ? '1px solid #86efac' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={noPrescriptionRequired}
                      onChange={(e) => setNoPrescriptionRequired(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {language === 'ta' ? 'மருந்து சீட்டு தேவையில்லை (ஆலோசனை மட்டும்)' : 'No Prescription Required (Documentation Only)'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {language === 'ta' 
                          ? 'ஆலோசனை, நீர்ச்சத்து, உணவுமுறை மற்றும் ஓய்வு மட்டுமே போதுமானது என ஆவணப்படுத்தவும்.'
                          : 'Document that clinical counseling, hydration, dietary modification, or observation only is required.'}
                      </div>
                    </div>
                  </label>
                  {noPrescriptionRequired && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed #bbf7d0' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                        CLINICAL JUSTIFICATION FOR NO PRESCRIPTION:
                      </label>
                      <input
                        type="text"
                        value={noPrescriptionReason}
                        onChange={(e) => setNoPrescriptionReason(e.target.value)}
                        placeholder="e.g. Mild viral syndrome; advised rest, oral fluids, and follow-up if fever persists."
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #86efac', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>

                {/* SAFETY ALERTS BANNER IF ANY */}
                {safetyWarnings.length > 0 && (
                  <div style={{
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #ef4444',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                      <AlertTriangle size={16} />
                      <span>PHARMACOVIGILANCE SAFETY WARNING DETECTED</span>
                    </div>
                    {safetyWarnings.map((w, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#991b1b', marginBottom: '0.25rem' }}>
                        • {w}
                      </div>
                    ))}

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #fca5a5' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.3rem' }}>
                        MANDATORY CLINICAL OVERRIDE REASON (தேவையான மருத்துவ விளக்கம்):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Verified mild childhood skin rash only; benefit outweighs risk under supervision"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #f87171',
                          fontSize: '0.8rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Medicines List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                  {medicines.map((med, idx) => (
                    <div
                      key={med.id}
                      style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>
                          MEDICINE #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveMedicine(med.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NAME</label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FORM</label>
                          <select
                            value={med.formulation}
                            onChange={(e) => handleUpdateMedicine(med.id, 'formulation', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          >
                            <option>Tablet</option>
                            <option>Capsule</option>
                            <option>Syrup</option>
                            <option>Injection</option>
                            <option>Ointment</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>STRENGTH</label>
                          <input
                            type="text"
                            value={med.strength}
                            onChange={(e) => handleUpdateMedicine(med.id, 'strength', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FREQUENCY</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DAYS</label>
                          <input
                            type="number"
                            value={med.durationDays}
                            onChange={(e) => handleUpdateMedicine(med.id, 'durationDays', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SPECIAL INSTRUCTIONS</label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) => handleUpdateMedicine(med.id, 'instructions', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Digital Signature & Submission */}
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--primary-bg)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={16} color="var(--primary-dark)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                        CRYPTOGRAPHIC DIGITAL SIGNATURE
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      SHA256 • Verified Reg No: {doctor?.registrationNumber}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                    By clicking below, I verify as a registered medical practitioner that I have evaluated the patient and authorize this digital prescription.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {/* Primary Protected Feature: Complete Encounter & Call Next */}
                    <button
                      onClick={handleOpenCompleteModal}
                      title={canCompleteAndCallNext ? 'Complete current encounter & atomically advance queue' : (getMissingPreconditionReason() || undefined)}
                      style={{
                        width: '100%',
                        padding: '0.95rem',
                        background: canCompleteAndCallNext
                          ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                          : '#cbd5e1',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: canCompleteAndCallNext ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        boxShadow: canCompleteAndCallNext ? '0 6px 18px rgba(13, 148, 136, 0.35)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Bell size={20} />
                      <span>
                        {language === 'ta'
                          ? '🔔 ஆலோசனையை முடித்து அடுத்த நோயாளியை அழைக்கவும்'
                          : '🔔 Complete Encounter & Call Next Patient'}
                      </span>
                    </button>

                    {!canCompleteAndCallNext && (
                      <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600, textAlign: 'center' }}>
                        * Precondition: {getMissingPreconditionReason()}
                      </div>
                    )}

                    {/* Secondary Action: Complete without auto-calling next */}
                    <button
                      onClick={handleSignAndComplete}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        background: '#ffffff',
                        color: 'var(--primary-dark)',
                        border: '1px solid var(--primary-border)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>{language === 'ta' ? 'கையொப்பமிட்டு மட்டுமே முடிக்கவும்' : 'Sign & Complete Current Encounter Only'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED CONSULTATIONS */}
      {activeTab === 'HISTORY' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem' }}>
            Today's Completed Consultations ({completedPrescriptions.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {completedPrescriptions.map(rx => (
              <div
                key={rx.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                      {rx.patientName} ({rx.patientAge}y, {rx.patientGender})
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
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Diagnosis: {rx.diagnosis}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Issued at {rx.issuedAt} • {rx.medicines.length} medications prescribed
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-mono)' }}>
                    Signature: {rx.doctorDigitalSignature.substring(0, 32)}...
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    background: rx.status === 'FULLY_DISPENSED' ? '#dcfce7' : rx.status === 'PARTIALLY_DISPENSED' ? '#fef3c7' : '#eff6ff',
                    color: rx.status === 'FULLY_DISPENSED' ? '#166534' : rx.status === 'PARTIALLY_DISPENSED' ? '#92400e' : '#1d4ed8',
                  }}>
                    {rx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE MODAL: CONFIRM COMPLETE ENCOUNTER & CALL NEXT */}
      {showCompleteModal && currentPatientEntry && doctor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '640px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bell size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {language === 'ta' ? 'ஆலோசனையை முடித்து அடுத்த நோயாளியை அழைக்கவும்' : 'Complete Encounter & Call Next Patient'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    {doctor.name} • {doctor.roomNumber} • Reg: {doctor.registrationNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCompleteModal(false)}
                disabled={isSubmittingEncounter}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* CURRENT ENCOUNTER SUMMARY */}
              <div style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  1. CURRENT PATIENT ENCOUNTER (தற்போதைய நோயாளி)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                      {currentPatientEntry.tokenNumber}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                      {currentPatientEntry.patientName}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
                    Duration: ~10 mins
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <strong>Diagnosis:</strong> {diagnosis || 'General Clinical Review'}
                </div>
              </div>

              {/* PRESCRIPTION & DELIVERY STATUS */}
              <div style={{
                padding: '1rem',
                background: noPrescriptionRequired ? '#f0fdf4' : '#eff6ff',
                borderRadius: '12px',
                border: noPrescriptionRequired ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: noPrescriptionRequired ? '#166534' : '#1e40af', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  2. PRESCRIPTION & SECURE DELIVERY GOVERNANCE
                </div>
                {noPrescriptionRequired ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '0.2rem' }}>
                      ✓ Documented: No Prescription Required
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                      {noPrescriptionReason}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.3rem' }}>
                      <ShieldCheck size={16} />
                      <span>Digitally Signed with SHA-256 Tamper Seal ({medicines.length} Medicines)</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', marginBottom: '0.3rem' }}>
                      Delivery Channel: Queued for WhatsApp & SMS Fallback (Async • Non-Blocking)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                      * DPDP / DISHA Protection: Notification previews strictly omit sensitive medical conditions and drug names.
                    </div>
                  </div>
                )}
              </div>

              {/* NEXT ELIGIBLE PATIENT PREVIEW */}
              <div style={{
                padding: '1rem',
                background: nextEligiblePreview ? (nextEligiblePreview.priorityLevel === 'EMERGENCY' ? '#fef2f2' : nextEligiblePreview.priorityLevel === 'HIGH_PRIORITY' ? '#fffbeb' : '#f0fdfa') : '#f8fafc',
                borderRadius: '12px',
                border: nextEligiblePreview ? (nextEligiblePreview.priorityLevel === 'EMERGENCY' ? '1px solid #fca5a5' : nextEligiblePreview.priorityLevel === 'HIGH_PRIORITY' ? '1px solid #fde68a' : '1px solid #99f6e4') : '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  3. NEXT ELIGIBLE IN QUEUE (அடுத்த வரிசை நோயாளி)
                </div>
                {nextEligiblePreview ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: nextEligiblePreview.priorityLevel === 'EMERGENCY' ? '#dc2626' : 'var(--primary)' }}>
                          {nextEligiblePreview.tokenNumber}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: nextEligiblePreview.priorityLevel === 'EMERGENCY' ? '#ef4444' : nextEligiblePreview.priorityLevel === 'HIGH_PRIORITY' ? '#f59e0b' : 'var(--primary-bg)',
                          color: nextEligiblePreview.priorityLevel === 'NORMAL' ? 'var(--primary-dark)' : '#fff',
                        }}>
                          {nextEligiblePreview.priorityLevel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {nextEligiblePreview.patientName} ({nextEligiblePreview.patientAge}y, {nextEligiblePreview.patientGender})
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Waiting since {nextEligiblePreview.joinedQueueAt} • Earliest priority
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-dark)', background: '#fff', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                        Will Call to {doctor.roomNumber}
                      </span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        3-Min Response Countdown
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Queue is empty. No more waiting patients at this station.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}>
              <button
                onClick={() => setShowCompleteModal(false)}
                disabled={isSubmittingEncounter}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteAndCallNext}
                disabled={isSubmittingEncounter}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: isSubmittingEncounter ? 'not-allowed' : 'pointer',
                  opacity: isSubmittingEncounter ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                }}
              >
                <Bell size={16} />
                <span>
                  {isSubmittingEncounter 
                    ? 'Processing Transaction...' 
                    : nextEligiblePreview
                      ? `Confirm: Complete & Call ${nextEligiblePreview.tokenNumber}`
                      : 'Confirm: Complete Encounter (Queue Empty)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
