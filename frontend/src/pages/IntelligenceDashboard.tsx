import React, { useState } from 'react';
import { smartcareStore } from '../api/smartcareStore';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Stethoscope, 
  Building2, 
  Settings, 
  Download, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText
} from 'lucide-react';

export const IntelligenceDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'CLINIC_CONFIG' | 'QUEUE_RULES'>('ANALYTICS');
  const [dateRange, setDateRange] = useState('TODAY');

  // Queue Rules State
  const [callTimerSeconds, setCallTimerSeconds] = useState(180);
  const [noShowCutoffMinutes, setNoShowCutoffMinutes] = useState(15);
  const [rejoinPolicy, setRejoinPolicy] = useState('END_OF_ACTIVE_QUEUE');
  const [notificationFallback, setNotificationFallback] = useState('WHATSAPP_THEN_SMS');
  const [rulesSavedNotice, setRulesSavedNotice] = useState(false);

  const doctors = smartcareStore.getDoctors();
  const queue = smartcareStore.getQueue();
  const prescriptions = smartcareStore.getPrescriptions();

  const handleSaveRules = () => {
    smartcareStore.logAudit('Administrator', 'ADMIN', 'QUEUE_RULES_UPDATED', 'ClinicRules', 'RULES-01', `Updated call timer to ${callTimerSeconds}s, cutoff to ${noShowCutoffMinutes}m, rejoin: ${rejoinPolicy}`);
    setRulesSavedNotice(true);
    setTimeout(() => setRulesSavedNotice(false), 3000);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset demo state to initial SmartCare sample data?')) {
      smartcareStore.resetDemoData();
      alert('Demo data restored to initial clean state.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              {language === 'ta' ? 'நிர்வாக பகுப்பாய்வு & மருத்துவமனை மேலாண்மை' : 'Admin Operations & Analytics'}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
            }}>
              CHIEF OPERATING OFFICER
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {language === 'ta'
              ? 'ஸ்மார்ட்கேர் மருத்துவ மையம், கோவில்பட்டி • காத்திருப்பு நேரம், மருத்துவர் செயல்திறன் மற்றும் வரிசை விதிகள்'
              : 'SmartCare Medical Centre, Kovilpatti • Patient flow metrics, throughput, clinic configuration, and queue rules.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/audit-logs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <ShieldCheck size={16} />
            <span>Audit & Security Logs</span>
          </Link>

          <button
            onClick={handleResetDemoData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Demo State</span>
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
          onClick={() => setActiveTab('ANALYTICS')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'ANALYTICS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'ANALYTICS' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'ANALYTICS' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <BarChart3 size={16} />
          <span>Patient Flow Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('CLINIC_CONFIG')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'CLINIC_CONFIG' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'CLINIC_CONFIG' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'CLINIC_CONFIG' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Building2 size={16} />
          <span>Clinics, Departments & Doctors</span>
        </button>

        <button
          onClick={() => setActiveTab('QUEUE_RULES')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'QUEUE_RULES' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'QUEUE_RULES' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'QUEUE_RULES' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Settings size={16} />
          <span>Queue Governance & Fallback Rules</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div>
          {/* Key Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                AVG WAITING TIME
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0d9488', margin: '0.3rem 0' }}>
                14.2 <span style={{ fontSize: '1rem', fontWeight: 600 }}>mins</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                ↓ 24% faster than clinic SLA
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                CHECK-IN VERIFICATION RATE
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', margin: '0.3rem 0' }}>
                91.6%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Via 2FA OTP & QR Pass
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                NO-SHOW RATE
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', margin: '0.3rem 0' }}>
                8.4%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target threshold &lt; 10%
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                RX DELIVERY SUCCESS
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', margin: '0.3rem 0' }}>
                98.2%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Encrypted links accessed
              </div>
            </div>
          </div>

          {/* Charts & Throughput Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
            {/* Doctor Throughput Table */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
                Doctor Station Throughput & Consultation Pace
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Dr. Arun Kumar', dept: 'General Medicine', completed: 24, avgConsult: '9.4 mins', status: 'AVAILABLE', load: 85 },
                  { name: 'Dr. Meera Raj', dept: 'Dermatology', completed: 18, avgConsult: '12.1 mins', status: 'AVAILABLE', load: 72 },
                  { name: 'Dr. Priya Nandakumar', dept: 'Paediatrics', completed: 22, avgConsult: '10.5 mins', status: 'AVAILABLE', load: 88 },
                  { name: 'Dr. Karthik Selvan', dept: 'Dental Surgery', completed: 16, avgConsult: '18.0 mins', status: 'AVAILABLE', load: 65 },
                ].map((doc, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                          {doc.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          ({doc.dept})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {doc.completed} patients seen • {doc.avgConsult} avg
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${doc.load}%`, height: '100%', background: 'var(--primary-gradient)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours & Bottleneck Indicator */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
                  Peak Arrival Windows & Load
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                  Distribution of check-in volume throughout operating hours
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {[
                    { time: '08:00 AM - 10:00 AM', load: 'Moderate (28 patients)', color: '#3b82f6', percent: 60 },
                    { time: '10:00 AM - 12:30 PM', load: 'PEAK LOAD (54 patients)', color: '#ef4444', percent: 95 },
                    { time: '12:30 PM - 02:00 PM', load: 'Low / Lunch Break', color: '#10b981', percent: 25 },
                    { time: '04:30 PM - 07:00 PM', load: 'High (42 patients)', color: '#f59e0b', percent: 80 },
                  ].map((p, idx) => (
                    <div key={idx} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 700 }}>{p.time}</span>
                        <span style={{ fontWeight: 700, color: p.color }}>{p.load}</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.percent}%`, height: '100%', background: p.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534' }}>
                ✓ Reception staffing recommended: 2 desks active between 09:30 AM and 12:30 PM.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINIC CONFIGURATION */}
      {activeTab === 'CLINIC_CONFIG' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.2rem 0' }}>
              SmartCare Medical Centre, Kovilpatti
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Primary Outpatient Facility • 5 Clinical Departments • 4 Practicing Consultants
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>
              DEPARTMENTS (5 Active Wings)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
              {['General Medicine', 'Dermatology', 'Paediatrics', 'Dental', 'Orthopaedics'].map((dept, i) => (
                <div key={i} style={{ padding: '0.85rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)' }}>{dept}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Active OPD</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>
              REGISTERED PHYSICIANS & CONSULTANTS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {doctors.map(d => (
                <div key={d.id} style={{ padding: '1.25rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)' }}>{d.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.qualification}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 600, marginTop: '0.3rem' }}>
                    Council Reg: {d.registrationNumber} • {d.roomNumber}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Hours: {d.workingHours}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUEUE RULES & NOTIFICATION POLICIES */}
      {activeTab === 'QUEUE_RULES' && (
        <div style={{ maxWidth: '720px', margin: '0 auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 0.2rem 0' }}>
            Queue Rules & Notification Policies
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Hospital SLA parameters for call timeouts, skip cutoffs, and patient notifications.
          </p>

          {rulesSavedNotice && (
            <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              ✓ Queue configuration rules updated and applied hospital-wide.
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              CALL WINDOW RESPONSE TIMER (SECONDS)
            </label>
            <input
              type="number"
              value={callTimerSeconds}
              onChange={(e) => setCallTimerSeconds(Number(e.target.value))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Window allocated to called patient before doctor may advance or mark skipped (Default: 180s / 3 mins).
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              NO-SHOW CUTOFF THRESHOLD (MINUTES PAST APPOINTMENT)
            </label>
            <input
              type="number"
              value={noShowCutoffMinutes}
              onChange={(e) => setNoShowCutoffMinutes(Number(e.target.value))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              REJOIN QUEUE PLACEMENT POLICY
            </label>
            <select
              value={rejoinPolicy}
              onChange={(e) => setRejoinPolicy(e.target.value)}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="END_OF_ACTIVE_QUEUE">End of Active Waiting Queue (Standard Clinic Rule)</option>
              <option value="NEXT_AFTER_CURRENT">Next Immediate Patient (Emergency / Special Approval)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              NOTIFICATION DISPATCH FALLBACK STRATEGY
            </label>
            <select
              value={notificationFallback}
              onChange={(e) => setNotificationFallback(e.target.value)}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="WHATSAPP_THEN_SMS">WhatsApp primary → SMS fallback if undelivered in 60s → In-App push</option>
              <option value="SMS_DIRECT">Direct SMS primary</option>
            </select>
          </div>

          <button
            onClick={handleSaveRules}
            style={{
              padding: '0.85rem 1.75rem',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Save & Enforce Rules
          </button>
        </div>
      )}
    </div>
  );
};
