import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Megaphone, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Flame,
  ArrowRight,
  Filter,
  Volume2
} from 'lucide-react';
import { queueService, doctorService, QueueEntry, Doctor } from '../api/services';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PatientQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPatient = user?.role === 'PATIENT';
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [calledTokenBanner, setCalledTokenBanner] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const [q, docs] = await Promise.all([
        queueService.getAll(),
        doctorService.getAll(),
      ]);
      setQueueEntries(q || []);
      setDoctors(docs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = async (entry: QueueEntry) => {
    try {
      await queueService.updateStatus(entry.queueEntryId, 'CALLED');
      setCalledTokenBanner(`Token #${entry.tokenNumber} — ${entry.patientName} called to Dr. ${entry.doctorName}`);
      loadQueue();
      setTimeout(() => setCalledTokenBanner(null), 8000);
    } catch (err: any) {
      alert('Failed to call patient: ' + err.message);
    }
  };

  const handleStartConsultation = async (entry: QueueEntry) => {
    try {
      await queueService.updateStatus(entry.queueEntryId, 'IN_CONSULTATION');
      navigate(`/consultation?visitId=${entry.visitId}`);
    } catch (err: any) {
      alert('Failed to start consultation: ' + err.message);
    }
  };

  const filteredQueue = selectedDoctorId === 'ALL' 
    ? queueEntries 
    : queueEntries.filter(q => q.doctorId === Number(selectedDoctorId));

  const activeQueue = filteredQueue.filter(q => q.queueStatus !== 'COMPLETED' && q.queueStatus !== 'CANCELLED');
  const completedQueue = filteredQueue.filter(q => q.queueStatus === 'COMPLETED');

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Patient Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Manage patient flow, call patients, and start consultations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            className="form-control"
            style={{ width: '260px' }}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="ALL">All Doctors</option>
            {doctors.map(d => (
              <option key={d.doctorId} value={d.doctorId}>Dr. {d.name} ({d.specialty})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Token Call Banner */}
      {calledTokenBanner && (
        <div style={{
          background: 'var(--primary-gradient)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.15rem 1.75rem',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.75rem',
          boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
          animation: 'fadeInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Volume2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontWeight: 600 }}>
              Now Calling
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {calledTokenBanner}
            </div>
          </div>
        </div>
      )}

      {/* Queue Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {activeQueue.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>No patients in queue currently.</div>
          </div>
        ) : (
          activeQueue.map((entry, idx) => (
            <div 
              key={entry.queueEntryId} 
              className="glass-card glass-card-interactive fade-in-up"
              style={{
                padding: '1.35rem',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${idx * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              {/* Priority accent */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                background: entry.priorityLevel === 'URGENT' ? 'linear-gradient(180deg, #ef4444, #f87171)' :
                  entry.priorityLevel === 'PRIORITY' ? 'linear-gradient(180deg, #f59e0b, #fbbf24)' :
                  'var(--primary-gradient)',
                borderRadius: '0 2px 2px 0',
              }} />

              {/* Token & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', paddingLeft: '0.35rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Token</span>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: entry.priorityLevel === 'URGENT' ? 'var(--red-accent)' : 'var(--primary)',
                    letterSpacing: '-0.03em',
                  }}>
                    #{entry.tokenNumber}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                  <span className={`badge ${
                    entry.queueStatus === 'CALLED' ? 'badge-blue' :
                    entry.queueStatus === 'IN_CONSULTATION' ? 'badge-green' : 'badge-yellow'
                  }`}>
                    {entry.queueStatus.replace('_', ' ')}
                  </span>
                  {entry.priorityLevel !== 'NORMAL' && (
                    <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>
                      <Flame size={10} /> {entry.priorityLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Patient Name with Privacy Safeguard */}
              <div style={{ marginBottom: '1rem', paddingLeft: '0.35rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {isPatient ? (
                    entry.patientId === user?.patientId ? `${entry.patientName} (You)` : `Patient #${String(entry.tokenNumber).padStart(2, '0')}`
                  ) : (
                    entry.patientName
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Doctor: <strong style={{ color: 'var(--text-heading)' }}>{entry.doctorName}</strong>
                </div>
              </div>

              {/* Wait Info */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                border: '1px solid var(--border-light)',
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em' }}>EST. WAIT</div>
                  <div style={{ fontWeight: 700, color: entry.estimatedWaitMinutes > 20 ? 'var(--amber-accent)' : 'var(--green-accent)' }}>~{entry.estimatedWaitMinutes} mins</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em' }}>AHEAD</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{entry.patientsAhead}</div>
                </div>
              </div>

              {/* Actions: Only for Staff/Doctors, hidden for Patients */}
              {!isPatient && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {entry.queueStatus === 'WAITING' && (
                    <button onClick={() => handleCallPatient(entry)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      <Megaphone size={13} /> Call
                    </button>
                  )}
                  {entry.queueStatus === 'CALLED' && (
                    <button onClick={() => handleStartConsultation(entry)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      <Play size={13} /> Start Consultation
                    </button>
                  )}
                  {entry.queueStatus === 'IN_CONSULTATION' && (
                    <button onClick={() => navigate(`/consultation?visitId=${entry.visitId}`)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                      View <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Completed */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={13} color="var(--green-accent)" />
          </div>
          Completed Today
          <span className="badge badge-green" style={{ marginLeft: '0.25rem' }}>{completedQueue.length}</span>
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {completedQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    No completed visits yet
                  </td>
                </tr>
              ) : (
                completedQueue.map(entry => (
                  <tr key={entry.queueEntryId}>
                    <td><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-heading)' }}>#{entry.tokenNumber}</span></td>
                    <td style={{ fontWeight: 600 }}>{entry.patientName}</td>
                    <td>{entry.doctorName}</td>
                    <td><span className="badge badge-green">COMPLETED</span></td>
                    <td>
                      <button onClick={() => navigate(`/prescriptions?patientId=${entry.patientId}`)} className="btn btn-secondary btn-sm">
                        View Rx
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
