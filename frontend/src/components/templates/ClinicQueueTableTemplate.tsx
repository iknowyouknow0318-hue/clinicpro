import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  Stethoscope, 
  Pill, 
  ArrowRight,
  MoreVertical,
  Volume2
} from 'lucide-react';
import { QueueEntry } from '../../api/services';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shadcn/Table';
import { Badge } from '../shadcn/Badge';
import { Button } from '../shadcn/Button';

export interface ClinicQueueTableTemplateProps {
  entries: QueueEntry[];
  onCallPatient?: (entry: QueueEntry) => void;
  onStartConsultation?: (entry: QueueEntry) => void;
  onComplete?: (entry: QueueEntry) => void;
  onNavigateDoctor?: (entry: QueueEntry) => void;
}

export const ClinicQueueTableTemplate: React.FC<ClinicQueueTableTemplateProps> = ({
  entries,
  onCallPatient,
  onStartConsultation,
  onComplete,
  onNavigateDoctor,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED'>('ALL');
  const [callingId, setCallingId] = useState<number | null>(null);

  const filteredEntries = entries.filter((item) => {
    const matchesSearch = 
      item.patientName.toLowerCase().includes(search.toLowerCase()) ||
      item.tokenNumber.toString().includes(search) ||
      item.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.queueStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <Badge variant="warning" dot pulse>Waiting in Lobby</Badge>;
      case 'CALLED':
        return <Badge variant="info" dot pulse>Called to Chamber</Badge>;
      case 'IN_CONSULTATION':
        return <Badge variant="teal" dot>In Doctor Room</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'PRIORITY':
        return <Badge variant="warning">Priority</Badge>;
      default:
        return <Badge variant="secondary">Regular</Badge>;
    }
  };

  const handleAnnounce = (entry: QueueEntry) => {
    setCallingId(entry.queueEntryId);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Token number ${entry.tokenNumber}, ${entry.patientName}, please proceed to ${entry.doctorName}'s chamber.`
      );
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
    if (onCallPatient) onCallPatient(entry);
    setTimeout(() => setCallingId(null), 3000);
  };

  return (
    <div>
      {/* Search and Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search token #, patient, doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '2.2rem',
                height: '36px',
                fontSize: '0.82rem',
                width: '100%',
              }}
            />
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {filteredEntries.length} of {entries.length} patients
          </span>
        </div>

        {/* Quick Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(['ALL', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: statusFilter === st ? 700 : 500,
                background: statusFilter === st ? 'var(--primary-bg)' : 'transparent',
                color: statusFilter === st ? 'var(--primary-dark)' : 'var(--text-secondary)',
                border: statusFilter === st ? '1px solid var(--primary-border)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {st === 'ALL' ? 'All Queue' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: '90px' }}>Token #</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Assigned Doctor</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Wait Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEntries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  <Clock size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No patients in selected queue</div>
                  <div style={{ fontSize: '0.78rem' }}>Check back as patients check in or switch the filter tab.</div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredEntries.map((item) => (
              <TableRow key={item.queueEntryId}>
                {/* Token Number */}
                <TableCell>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'var(--primary-bg)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary-dark)',
                      fontWeight: 800,
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.96rem',
                    }}
                  >
                    #{item.tokenNumber}
                  </div>
                </TableCell>

                {/* Patient Name */}
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.patientName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {item.patientName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Patient #{item.patientId}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Consulting Doctor */}
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Stethoscope size={14} color="var(--primary)" />
                    <span style={{ fontWeight: 500 }}>{item.doctorName}</span>
                  </div>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  {getPriorityBadge(item.priorityLevel)}
                </TableCell>

                {/* Wait Time */}
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span>~{item.estimatedWaitMinutes || 10}m</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusBadge(item.queueStatus)}
                </TableCell>

                {/* Actions */}
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                    {item.queueStatus === 'WAITING' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Volume2 size={13} />}
                        loading={callingId === item.queueEntryId}
                        onClick={() => handleAnnounce(item)}
                      >
                        Call
                      </Button>
                    )}

                    {item.queueStatus === 'CALLED' && onStartConsultation && (
                      <Button
                        size="sm"
                        variant="default"
                        icon={<Stethoscope size={13} />}
                        onClick={() => onStartConsultation(item)}
                      >
                        Start Consult
                      </Button>
                    )}

                    {item.queueStatus === 'IN_CONSULTATION' && onNavigateDoctor && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<ArrowRight size={13} />}
                        onClick={() => onNavigateDoctor(item)}
                      >
                        Doctor Desk
                      </Button>
                    )}

                    {item.queueStatus !== 'COMPLETED' && onComplete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onComplete(item)}
                        title="Mark Completed"
                      >
                        <CheckCircle2 size={14} color="var(--green-accent)" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
