import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  UserPlus, 
  Calendar, 
  Clock, 
  Stethoscope, 
  FileText, 
  Pill, 
  Package, 
  BarChart3, 
  X,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';

export interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickToken?: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onQuickToken }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open menu
          const event = new CustomEvent('open-command-menu');
          window.dispatchEvent(event);
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      group: 'Quick Operations',
      items: [
        {
          title: 'Generate Walk-in Token',
          description: 'Instantly issue a live token for a walk-in patient',
          icon: <Sparkles size={16} color="var(--primary)" />,
          action: () => {
            onClose();
            if (onQuickToken) onQuickToken();
            else navigate('/reception');
          },
          badge: 'Immediate',
        },
        {
          title: 'Register New Patient',
          description: 'Full intake form, demographics and emergency contacts',
          icon: <UserPlus size={16} color="var(--blue-accent)" />,
          action: () => { onClose(); navigate('/register-patient'); },
        },
        {
          title: 'Book Doctor Appointment',
          description: 'Schedule a future visit or consultation slot',
          icon: <Calendar size={16} color="var(--green-accent)" />,
          action: () => { onClose(); navigate('/appointments'); },
        },
      ],
    },
    {
      group: 'Clinical Flow Navigation',
      items: [
        {
          title: 'Reception Front Desk',
          description: 'Tokens, daily queue, active check-ins',
          icon: <LayoutDashboard size={16} />,
          action: () => { onClose(); navigate('/reception'); },
        },
        {
          title: 'Live Clinic Queue TV',
          description: 'Waiting room display with calling announcements',
          icon: <Clock size={16} />,
          action: () => { onClose(); navigate('/queue'); },
        },
        {
          title: 'Doctor Consultation Station',
          description: 'In-chair patient, clinical observations, Rx builder',
          icon: <Stethoscope size={16} />,
          action: () => { onClose(); navigate('/doctor'); },
        },
        {
          title: 'Pharmacy Dispensing Desk',
          description: 'Verify prescription, FEFO batch dispensing',
          icon: <Pill size={16} />,
          action: () => { onClose(); navigate('/pharmacy'); },
        },
        {
          title: 'Medicine Inventory & Stock',
          description: 'Batches, expiry tracker, reorder alerts',
          icon: <Package size={16} />,
          action: () => { onClose(); navigate('/inventory'); },
        },
        {
          title: 'Clinic Intelligence Analytics',
          description: 'Throughput metrics, wait time trends, revenue',
          icon: <BarChart3 size={16} />,
          action: () => { onClose(); navigate('/intelligence'); },
        },
      ],
    },
  ];

  const filteredGroups = actions
    .map((grp) => ({
      ...grp,
      items: grp.items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-2xl)',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            gap: '0.75rem',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, jump to a station, or search workflow..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.92rem',
              color: 'var(--text-heading)',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.2rem 0.45rem',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.6rem' }}>
          {filteredGroups.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No clinical actions found matching "{query}"</p>
            </div>
          ) : (
            filteredGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '0.4rem 0.65rem',
                  }}
                >
                  {group.group}
                </div>

                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    onClick={item.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {item.badge && (
                        <span
                          style={{
                            background: 'var(--primary-bg)',
                            color: 'var(--primary-dark)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span><kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--bg-card)', borderRadius: '3px', border: '1px solid var(--border-color)' }}>↵</kbd> Select</span>
            <span><kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--bg-card)', borderRadius: '3px', border: '1px solid var(--border-color)' }}>↑↓</kbd> Navigate</span>
          </div>
          <span>ClinicFlow AI Command Launcher</span>
        </div>
      </div>
    </div>
  );
};
