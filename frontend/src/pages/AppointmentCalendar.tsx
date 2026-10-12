import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, CheckCircle2, X, User } from 'lucide-react';
import { appointmentService, doctorService, patientService, Appointment, Doctor, Patient } from '../api/services';

export const AppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filterDoctorId, setFilterDoctorId] = useState<string>('ALL');
  const [showBooking, setShowBooking] = useState(false);

  // Booking form
  const [bookPatientId, setBookPatientId] = useState<number | ''>('');
  const [bookDoctorId, setBookDoctorId] = useState<number | ''>('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00');
  const [bookReason, setBookReason] = useState('General Consultation');
  const [bookSuccess, setBookSuccess] = useState('');

  const loadData = async () => {
    const [apts, docs, pts] = await Promise.all([
      appointmentService.getAll(),
      doctorService.getAll(),
      patientService.getAll(),
    ]);
    setAppointments(apts || []);
    setDoctors(docs || []);
    setPatients(pts || []);
    if (docs?.length) setBookDoctorId(docs[0].doctorId);
    if (pts?.length) setBookPatientId(pts[0].patientId);
    const today = new Date().toISOString().split('T')[0];
    setBookDate(today);
  };

  useEffect(() => { loadData(); }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPatientId || !bookDoctorId || !bookDate) return;
    try {
      await appointmentService.book({
        patientId: Number(bookPatientId),
        doctorId: Number(bookDoctorId),
        scheduledAt: `${bookDate}T${bookTime}:00`,
        reason: bookReason,
      });
      setBookSuccess('Appointment booked successfully!');
      loadData();
      setTimeout(() => { setBookSuccess(''); setShowBooking(false); }, 3000);
    } catch (err: any) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filterDoctorId === 'ALL'
    ? appointments
    : appointments.filter(a => a.doctorId === Number(filterDoctorId));

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Appointments</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Schedule and manage patient appointments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <select className="form-control" style={{ width: '220px' }} value={filterDoctorId} onChange={(e) => setFilterDoctorId(e.target.value)}>
            <option value="ALL">All Doctors</option>
            {doctors.map(d => (<option key={d.doctorId} value={d.doctorId}>Dr. {d.name}</option>))}
          </select>
          <button onClick={() => setShowBooking(true)} className="btn btn-primary">
            <Plus size={15} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="glass-card" style={{
            width: '480px', padding: '2rem', boxShadow: 'var(--shadow-2xl)',
            animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius)', background: 'var(--primary-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} color="var(--primary)" />
                </div>
                Book Appointment
              </h2>
              <button onClick={() => setShowBooking(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {bookSuccess && (
              <div style={{
                background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)',
                padding: '0.75rem', marginBottom: '1rem', color: 'var(--green-accent)', fontWeight: 600, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem', animation: 'scaleIn 0.3s ease',
              }}>
                <CheckCircle2 size={15} /> {bookSuccess}
              </div>
            )}

            <form onSubmit={handleBook}>
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select className="form-control" value={bookPatientId} onChange={(e) => setBookPatientId(Number(e.target.value))} required>
                  {patients.map(p => (<option key={p.patientId} value={p.patientId}>{p.name} ({p.phone})</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select className="form-control" value={bookDoctorId} onChange={(e) => setBookDoctorId(Number(e.target.value))} required>
                  {doctors.map(d => (<option key={d.doctorId} value={d.doctorId}>Dr. {d.name} — {d.specialty}</option>))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={bookDate} onChange={(e) => setBookDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-control" value={bookTime} onChange={(e) => setBookTime(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input type="text" className="form-control" value={bookReason} onChange={(e) => setBookReason(e.target.value)} placeholder="e.g. Follow-up, Check-up" />
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Calendar size={14} /> Confirm Booking
                </button>
                <button type="button" onClick={() => setShowBooking(false)} className="btn btn-secondary" style={{ flex: 0.5 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className="glass-card fade-in-up" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    <Calendar size={28} style={{ opacity: 0.25, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                    No appointments found
                  </td>
                </tr>
              ) : (
                filtered.map(apt => (
                  <tr key={apt.appointmentId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <Calendar size={13} color="var(--primary)" />
                        {new Date(apt.scheduledAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                        <Clock size={10} /> {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{apt.patientName}</div>
                    </td>
                    <td>{apt.doctorName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{apt.reason || 'General'}</td>
                    <td>
                      <span className={`badge ${
                        apt.status === 'COMPLETED' ? 'badge-green' :
                        apt.status === 'CANCELLED' ? 'badge-red' :
                        apt.status === 'CONFIRMED' ? 'badge-blue' : 'badge-yellow'
                      }`}>
                        {apt.status}
                      </span>
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
