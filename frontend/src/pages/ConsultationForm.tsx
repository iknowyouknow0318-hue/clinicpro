import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Pill, Plus, Trash2, CheckCircle2, ArrowRight,
  Calendar, Sparkles, Stethoscope, Heart, AlertTriangle, ShieldAlert,
  Info, History, Copy, Layers, Check
} from 'lucide-react';
import { 
  consultationService, prescriptionService, inventoryService, followUpService, queueService,
  Consultation, Medicine, PrescriptionItem, MedicationReconciliation 
} from '../api/services';
import { ClinicConsultationTemplates, ClinicalTemplate } from '../components/templates/ClinicConsultationTemplates';
import { PageHeader, Badge, Button } from '../components/shadcn';

export const ConsultationForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const visitIdParam = searchParams.get('visitId');

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reconciliation, setReconciliation] = useState<MedicationReconciliation | null>(null);
  const [loading, setLoading] = useState(true);

  // Clinical Assessment & Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const handleSelectClinicalTemplate = (tmpl: ClinicalTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setSymptoms(tmpl.chiefComplaint);
    setDiagnosisNotes(tmpl.diagnosis);
    setClinicalNotes(`${tmpl.observations}\nRecommended Tests: ${tmpl.recommendedTests}\nAdvice: ${tmpl.advice}`);
  };

  // Prescription Items
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number | ''>('');
  const [dosage, setDosage] = useState('500mg (1 Tab)');
  const [frequency, setFrequency] = useState('1-0-1 (Twice Daily)');
  const [timing, setTiming] = useState('Morning (After Food), Night (After Food)');
  const [durationDays, setDurationDays] = useState(5);
  const [quantity, setQuantity] = useState(10);
  const [instructions, setInstructions] = useState('Take with warm water after meals');
  const [generalRxInstructions, setGeneralRxInstructions] = useState('Complete the full course as prescribed. Hydrate adequately.');

  // Follow-up
  const [needFollowUp, setNeedFollowUp] = useState(true);
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [followUpReason, setFollowUpReason] = useState('Review treatment response & vital signs');

  // Completed State
  const [completedSuccess, setCompletedSuccess] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const meds = await inventoryService.getMedicines();
        setMedicines(meds || []);
        if (meds && meds.length > 0) setSelectedMedId(meds[0].medicineId);

        let visitId = visitIdParam ? Number(visitIdParam) : null;
        if (!visitId) {
          const q = await queueService.getAll();
          const active = q.find(item => item.queueStatus === 'IN_CONSULTATION' || item.queueStatus === 'CALLED');
          if (active) visitId = active.visitId;
        }

        if (visitId) {
          const c = await consultationService.start(visitId);
          setConsultation(c);
          setSymptoms(c.symptoms || '');
          setDiagnosisNotes(c.diagnosisNotes || '');
          setClinicalNotes(c.clinicalNotes || '');

          // Load Medication Reconciliation for this patient
          if (c.patientId) {
            const recon = await prescriptionService.getReconciliation(c.patientId);
            setReconciliation(recon);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [visitIdParam]);

  const handleAddMedicine = () => {
    if (!selectedMedId) return;
    const med = medicines.find(m => m.medicineId === Number(selectedMedId));
    if (!med) return;

    setRxItems([
      ...rxItems,
      {
        medicineId: med.medicineId,
        medicineName: med.name,
        genericName: med.genericName,
        dosage,
        frequency,
        timing,
        durationDays: Number(durationDays),
        quantity: Number(quantity),
        instructions,
      }
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setRxItems(rxItems.filter((_, i) => i !== index));
  };

  const handleImportPriorMed = (item: PrescriptionItem) => {
    setRxItems([
      ...rxItems,
      {
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        genericName: item.genericName,
        dosage: item.dosage,
        frequency: item.frequency,
        timing: item.timing || 'After food',
        durationDays: item.durationDays,
        quantity: item.quantity,
        instructions: item.instructions || 'Continue previous regimen',
      }
    ]);
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultation) return;

    try {
      const savedConsult = await consultationService.save({
        consultationId: consultation.consultationId,
        visitId: consultation.visitId,
        symptoms,
        diagnosisNotes,
        clinicalNotes,
        status: 'COMPLETED',
      });

      let createdRx = null;
      if (rxItems.length > 0) {
        createdRx = await prescriptionService.create({
          consultationId: consultation.consultationId,
          instructions: generalRxInstructions,
          items: rxItems,
        });
      }

      if (needFollowUp) {
        await followUpService.schedule({
          visitId: consultation.visitId,
          patientId: consultation.patientId,
          scheduledDate: followUpDate,
          reason: followUpReason,
        });
      }

      setCompletedSuccess({
        consultation: savedConsult,
        prescription: createdRx,
        followUp: needFollowUp,
      });
    } catch (err: any) {
      alert('Failed to complete consultation: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'pulse 0.8s linear infinite' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading clinical consultation station...</div>
        </div>
      </div>
    );
  }

  if (!consultation && !completedSuccess) {
    return (
      <div className="page-body">
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-input)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Stethoscope size={28} color="var(--text-muted)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-heading)', fontSize: '1.3rem' }}>No Active Consultation</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Please call a patient from the Doctor Live Station or Queue to begin clinical assessment.
          </p>
          <button onClick={() => navigate('/doctor')} className="btn btn-primary">
            <Stethoscope size={15} /> Open Doctor Station
          </button>
        </div>
      </div>
    );
  }

  if (completedSuccess) {
    return (
      <div className="page-body" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="glass-card" style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--green-bg)',
          border: '1px solid var(--green-border)',
          animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          }}>
            <CheckCircle2 size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-heading)', fontWeight: 800 }}>
            Consultation Successfully Finalized!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Clinical assessment recorded, Prescription (V{completedSuccess.prescription?.version || 1}) issued, daily patient schedule auto-generated, and order routed to clinic pharmacy.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/doctor')} className="btn btn-primary" style={{ fontWeight: 700 }}>
              Return to Doctor Station <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/queue')} className="btn btn-secondary">
              View Clinic Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Patient Header Banner */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, #ffffff, #f0fdf4)',
        border: '1px solid var(--primary-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <span className="badge badge-green" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.68rem' }}>
            Active Consultation • Visit #{consultation?.visitId}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--text-heading)' }}>
            {consultation?.patientName}
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Consulting Doctor: <strong>{consultation?.doctorName}</strong> • Started at {new Date(consultation?.startedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <button onClick={() => navigate('/doctor')} className="btn btn-secondary btn-sm">
          ← Back to Station
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Clinical Assessment & Prescription Form */}
        <form onSubmit={handleCompleteConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Clinical Assessment Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Stethoscope size={18} color="var(--primary)" /> Clinical Assessment & Symptoms
            </h3>

            {/* Shadcn Clinical Templates Picker */}
            <ClinicConsultationTemplates
              onSelectTemplate={handleSelectClinicalTemplate}
              selectedTemplateId={selectedTemplateId}
            />

            <div className="form-group">
              <label className="form-label">Chief Complaints / Presenting Symptoms *</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. Fever for 3 days, dry cough, body aches..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Diagnosis *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Upper Respiratory Tract Infection (Viral)"
                value={diagnosisNotes}
                onChange={(e) => setDiagnosisNotes(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Doctor Clinical Notes & Observations</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Vitals: BP 120/80, Temp 99.4°F, Chest clear. Advised hydration and rest."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Prescription Builder Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Pill size={18} color="var(--primary)" /> Digital Prescription Builder
              </h3>
              <span className="badge badge-blue">
                Version Control Enabled
              </span>
            </div>

            {/* Add Medicine Sub-form */}
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Medicine (Master Catalogue)</label>
                  <select
                    className="form-control"
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(Number(e.target.value))}
                  >
                    {medicines.map(m => (
                      <option key={m.medicineId} value={m.medicineId}>
                        {m.name} ({m.genericName}) — {m.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 500mg / 1 Tab"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr 0.8fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Frequency</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1-0-1 (Twice Daily)"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Timing Details</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Morning, Night (After Food)"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Qty</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Special Instructions</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Take with warm water after food"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, gap: '0.35rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={15} /> Add to Prescription
                </button>
              </div>
            </div>

            {/* Prescribed Items Table */}
            {rxItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No medicines added to this prescription yet.
              </div>
            ) : (
              <div className="table-container" style={{ marginBottom: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dosage & Frequency</th>
                      <th>Timing</th>
                      <th>Duration</th>
                      <th>Qty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rxItems.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{it.medicineName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{it.genericName}</div>
                        </td>
                        <td>
                          <strong>{it.dosage}</strong> • <span style={{ color: 'var(--primary)' }}>{it.frequency}</span>
                        </td>
                        <td>{it.timing}</td>
                        <td>{it.durationDays}d</td>
                        <td><strong>{it.quantity}</strong></td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            style={{ background: 'none', border: 'none', color: 'var(--red-accent)', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">General Prescription Instructions & Dietary Advice</label>
              <input
                type="text"
                className="form-control"
                value={generalRxInstructions}
                onChange={(e) => setGeneralRxInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Follow-up Planning */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: needFollowUp ? '1rem' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Follow-Up Consultation</h3>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={needFollowUp}
                  onChange={(e) => setNeedFollowUp(e.target.checked)}
                />
                Schedule follow-up recall
              </label>
            </div>

            {needFollowUp && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Recall Date</label>
                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Clinical Review Reason</label>
                  <input
                    type="text"
                    className="form-control"
                    value={followUpReason}
                    onChange={(e) => setFollowUpReason(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Finalize Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ fontWeight: 800, padding: '0.9rem', fontSize: '1rem', gap: '0.5rem', justifyContent: 'center' }}
          >
            <CheckCircle2 size={18} /> Finalize Consultation & Issue Prescription
          </button>
        </form>

        {/* Right Column: Medication Reconciliation & Safety Warnings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Safety Verification Alerts */}
          {reconciliation && reconciliation.safetyAlerts.length > 0 && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius)',
              background: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
              color: 'var(--amber-accent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                <ShieldAlert size={16} /> Clinical Safety Alerts
              </div>
              {reconciliation.safetyAlerts.map((alert, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                  • {alert}
                </div>
              ))}
            </div>
          )}

          {/* Duplicate Warnings */}
          {reconciliation && reconciliation.duplicateWarnings.length > 0 && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius)',
              background: 'var(--red-bg)',
              border: '1px solid var(--red-border)',
              color: 'var(--red-accent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                <AlertTriangle size={16} /> Duplicate Therapy Alerts
              </div>
              {reconciliation.duplicateWarnings.map((dup, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                  • {dup}
                </div>
              ))}
            </div>
          )}

          {/* Medication Reconciliation Panel */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={16} color="var(--primary)" /> Medication Reconciliation
              </h3>
              <span className="badge badge-purple">Audit Trail</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Review patient's existing active and previous medications before finalizing new prescription.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '450px', overflowY: 'auto' }}>
              {(!reconciliation || reconciliation.currentMedicines.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No active prior medications on record.
                </div>
              ) : (
                reconciliation.currentMedicines.map(pm => (
                  <div key={pm.prescriptionItemId} style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)' }}>{pm.medicineName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pm.genericName} • {pm.dosage}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                          {pm.frequency} ({pm.timing || 'Standard'})
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleImportPriorMed(pm)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
                        title="Import to current prescription"
                      >
                        <Copy size={11} /> Re-prescribe
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
