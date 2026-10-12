import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, Pill, CheckCircle2, Bell, ArrowRight, User, Hash
} from 'lucide-react';
import { queueService, notificationService, patientService, QueueEntry, Notification, Patient } from '../api/services';

export const PatientStatusPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [activeQueueEntry, setActiveQueueEntry] = useState<QueueEntry | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getAll().then(pts => {
      setPatients(pts || []);
      if (pts && pts.length > 0) setSelectedPatientId(pts[0].patientId);
    });
  }, []);

  const loadPatientJourney = async (pId: number) => {
    try {
      const [allQ, notifs] = await Promise.all([
        queueService.getAll(),
        notificationService.getByPatient(pId),
      ]);
      const match = allQ.find(q => q.patientId === pId && q.queueStatus !== 'COMPLETED');
      setActiveQueueEntry(match || allQ.find(q => q.patientId === pId) || null);
      setNotifications(notifs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientJourney(Number(selectedPatientId));
      const interval = setInterval(() => loadPatientJourney(Number(selectedPatientId)), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedPatientId]);

  const journeySteps = [
    { label: 'Check-In', done: true },
    { label: 'Queue', done: true },
    { label: 'Doctor Visit', done: activeQueueEntry?.queueStatus === 'IN_CONSULTATION' || activeQueueEntry?.queueStatus === 'COMPLETED' },
    { label: 'Pharmacy', done: activeQueueEntry?.queueStatus === 'COMPLETED' },
    { label: 'Collect', done: false },
  ];

  return (
    <div className="page-body" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Patient Selector */}
      <div className="glass-card fade-in-up" style={{ padding: '1rem 1.35rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={13} color="var(--primary)" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-heading)' }}>Patient Tracker:</span>
        </div>
        <select className="form-control" style={{ maxWidth: '340px' }} value={selectedPatientId} onChange={(e) => setSelectedPatientId(Number(e.target.value))}>
          {patients.map(p => (<option key={p.patientId} value={p.patientId}>{p.name} ({p.phone})</option>))}
        </select>
      </div>

      {activeQueueEntry ? (
        <>
          {/* Status Card */}
          <div className="glass-card fade-in-up" style={{
            padding: '2.5rem', textAlign: 'center', marginBottom: '2rem',
            background: 'var(--primary-gradient-soft)', border: '1px solid var(--primary-border)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary-bg)', opacity: 0.4 }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-bg)', opacity: 0.3 }} />

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>
              Queue Token
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 900, lineHeight: 1,
              background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em', marginBottom: '1rem', position: 'relative',
            }}>
              #{activeQueueEntry.tokenNumber}
            </div>

            <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
              <span className={`badge ${
                activeQueueEntry.queueStatus === 'CALLED' ? 'badge-blue' :
                activeQueueEntry.queueStatus === 'IN_CONSULTATION' ? 'badge-green' :
                activeQueueEntry.queueStatus === 'COMPLETED' ? 'badge-purple' : 'badge-yellow'
              }`} style={{ fontSize: '0.82rem', padding: '0.4rem 1.15rem' }}>
                {activeQueueEntry.queueStatus === 'CALLED' ? '🔔 Now Being Called' :
                 activeQueueEntry.queueStatus === 'IN_CONSULTATION' ? '🩺 In Consultation' :
                 activeQueueEntry.queueStatus === 'COMPLETED' ? '✅ Completed' : '⏳ Waiting'}
              </span>
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.3rem' }}>
              Dr. {activeQueueEntry.doctorName}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Priority: <strong>{activeQueueEntry.priorityLevel}</strong>
            </div>

            {/* Wait Metrics */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem',
              marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)',
            }}>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>ESTIMATED WAIT</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--green-accent)', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
                  ~{activeQueueEntry.estimatedWaitMinutes} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>mins</span>
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>PATIENTS AHEAD</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
                  {activeQueueEntry.patientsAhead}
                </div>
              </div>
            </div>
          </div>

          {/* Journey Steps */}
          <div className="glass-card fade-in-up" style={{ padding: '1.75rem', marginBottom: '2rem', animationDelay: '0.1s', animationFillMode: 'both' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: 'var(--text-heading)' }}>Visit Journey</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
              {/* Progress Line */}
              <div style={{
                position: 'absolute', top: '17px', left: '3rem', right: '3rem', height: '3px',
                background: 'var(--border-color)', borderRadius: 'var(--radius-full)', zIndex: 0,
              }}>
                <div style={{
                  height: '100%', borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-gradient)',
                  width: `${(journeySteps.filter(s => s.done).length - 1) / (journeySteps.length - 1) * 100}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>

              {journeySteps.map((step, idx) => (
                <div key={idx} style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: step.done ? 'var(--primary-gradient)' : 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem', color: step.done ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.82rem', fontWeight: 700,
                    border: step.done ? 'none' : '2px solid var(--border-color)',
                    boxShadow: step.done ? '0 3px 10px rgba(13, 148, 136, 0.3)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {step.done ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: step.done ? 700 : 500, color: step.done ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <Activity size={32} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '0.95rem' }}>No active visit found for this patient today.</div>
        </div>
      )}

      {/* Notifications */}
      <div className="glass-card fade-in-up" style={{ padding: '1.5rem', animationDelay: '0.15s', animationFillMode: 'both' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={14} color="var(--primary)" />
          </div>
          Notifications
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Bell size={24} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
              <div>No notifications yet</div>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.notificationId} style={{
                padding: '0.85rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-border)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <span className="badge badge-green">Sent</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
