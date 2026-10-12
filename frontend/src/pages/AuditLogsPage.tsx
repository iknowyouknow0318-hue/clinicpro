import React, { useState, useEffect } from 'react';
import { smartcareStore, AuditLog, SecurityEvent } from '../api/smartcareStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  ShieldAlert, 
  Clock, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  FileText, 
  Lock, 
  RefreshCw,
  User,
  KeyRound
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'SECURITY'>('AUDIT');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    const updateLogs = () => {
      setAuditLogs(smartcareStore.getAuditLogs());
      setSecurityEvents(smartcareStore.getSecurityEvents());
    };
    updateLogs();
    const unsub = smartcareStore.subscribe(updateLogs);
    return () => unsub();
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = roleFilter === 'ALL' || log.role === roleFilter;
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getActionColor = (action: string) => {
    if (action.includes('EMERGENCY') || action.includes('OVERRIDE')) return 'var(--red-dark, #dc2626)';
    if (action.includes('SIGNED') || action.includes('PRESCRIPTION')) return 'var(--green-dark, #059669)';
    if (action.includes('CALL_NEXT') || action.includes('CHECKIN')) return 'var(--primary, #0284c7)';
    if (action.includes('LOGIN') || action.includes('OTP')) return '#8b5cf6';
    if (action.includes('SKIPPED')) return 'var(--amber-dark, #d97706)';
    return '#64748b';
  };

  const exportCsv = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'EntityType', 'EntityID', 'Details', 'IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartcare_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-bg)',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={18} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              {language === 'ta' ? 'பாதுகாப்பு & தணிக்கை பதிவேடு' : 'Security & Clinical Audit Trail'}
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {language === 'ta'
              ? 'அனைத்து உள்நுழைவு, டோக்கன் அழைப்பு, அவசர முன்னுரிமை மாற்றம் மற்றும் மருந்து சீட்டு செயல்பாடுகளின் மாற்ற முடியாத பதிவு'
              : 'Tamper-evident log of all logins, token advances, emergency priority overrides, check-ins, and digital prescriptions.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={exportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
      }}>
        <button
          onClick={() => setActiveTab('AUDIT')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'AUDIT' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'AUDIT' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'AUDIT' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={16} />
          <span>Operational Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'SECURITY' ? '2px solid #ef4444' : '2px solid transparent',
            color: activeTab === 'SECURITY' ? '#ef4444' : 'var(--text-secondary)',
            fontWeight: activeTab === 'SECURITY' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldAlert size={16} />
          <span>Security Incidents & Replay Alerts ({securityEvents.length})</span>
        </button>
      </div>

      {activeTab === 'AUDIT' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action, user name, details, or entity ID..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  background: 'transparent',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: '#f8fafc',
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="DOCTOR">Doctor</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="TRIAGE_NURSE">Triage Nurse</option>
                <option value="PATIENT">Patient</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Actor / Role</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Action</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Entity</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Clinical & Audit Details</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 650 }}>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actColor = getActionColor(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {log.timestamp}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{log.userName}</div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: '#f1f5f9',
                          color: '#475569',
                        }}>
                          {log.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '5px',
                          background: `${actColor}15`,
                          color: actColor,
                          border: `1px solid ${actColor}30`,
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{log.entityType}</div>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{log.entityId}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', maxWidth: '380px' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SECURITY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {securityEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${evt.severity === 'HIGH' ? '#ef4444' : evt.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}`,
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: evt.severity === 'HIGH' ? '#fef2f2' : evt.severity === 'MEDIUM' ? '#fffbeb' : '#eff6ff',
                    color: evt.severity === 'HIGH' ? '#b91c1c' : evt.severity === 'MEDIUM' ? '#b45309' : '#1d4ed8',
                  }}>
                    {evt.severity} SEVERITY
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                    {evt.eventType}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {evt.description}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                  <span>Source: {evt.sourceIp}</span>
                  <span>Attempted by: {evt.attemptedBy}</span>
                  <span>Logged at: {evt.timestamp}</span>
                </div>
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: evt.status === 'RESOLVED' ? '#10b981' : '#f59e0b',
                background: evt.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
              }}>
                {evt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
