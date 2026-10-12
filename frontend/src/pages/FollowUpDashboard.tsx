import React, { useState, useEffect } from 'react';
import { RotateCcw, Calendar, CheckCircle, Clock, User } from 'lucide-react';
import { followUpService, FollowUp } from '../api/services';

export const FollowUpDashboard: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await followUpService.getAll();
      setFollowUps(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkComplete = async (id: number) => {
    try {
      await followUpService.updateStatus(id, 'COMPLETED');
      loadData();
      alert('Follow-up marked as completed!');
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Follow-Up Recalls</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Schedule and track patient follow-up appointments
        </p>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Date</th>
                <th>Patient</th>
                <th>Visit</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No follow-ups scheduled
                  </td>
                </tr>
              ) : (
                followUps.map(f => (
                  <tr key={f.followUpId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--primary)" />
                        {f.scheduledDate}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.patientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID #{f.patientId}</div>
                    </td>
                    <td>Visit #{f.visitId}</td>
                    <td>{f.reason || 'General review'}</td>
                    <td>
                      <span className={`badge ${f.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      {f.status === 'SCHEDULED' ? (
                        <button onClick={() => handleMarkComplete(f.followUpId)} className="btn btn-primary btn-sm">
                          <CheckCircle size={13} /> Complete
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {f.completedAt ? new Date(f.completedAt).toLocaleDateString() : 'Done'}
                        </span>
                      )}
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
