import React from 'react';
import { 
  Sparkles, 
  UserPlus, 
  Stethoscope, 
  Pill, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';

export interface ClinicQuickActionHeroProps {
  clinicName?: string;
  activeDoctors?: number;
  waitingCount?: number;
  onQuickToken: () => void;
  onRegisterPatient: () => void;
  onDoctorStation: () => void;
  onPharmacyDesk: () => void;
}

export const ClinicQuickActionHero: React.FC<ClinicQuickActionHeroProps> = ({
  clinicName = 'Apex Medical Health System',
  activeDoctors = 3,
  waitingCount = 4,
  onQuickToken,
  onRegisterPatient,
  onDoctorStation,
  onPharmacyDesk,
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(8, 145, 178, 0.04) 50%, var(--bg-card) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Info Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-bg)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary-dark)',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Building2 size={12} />
              {clinicName}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.74rem',
                color: 'var(--green-dark)',
                background: 'var(--green-bg)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              <span className="status-dot status-dot--online" />
              Live Clinic Operations
            </span>
          </div>

          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-heading)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Operational Control & Patient Flow Engine
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            Unified coordination across Reception, Consultation, Prescriptions, Pharmacy, and Queue.
          </p>
        </div>

        {/* Real-time Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Clock size={16} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                In Waiting Queue
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {waitingCount} Patients
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <ShieldCheck size={16} color="var(--green-accent)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Active Doctors
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {activeDoctors} On Duty
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {/* Quick Token */}
        <div
          onClick={onQuickToken}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-bg)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Quick Walk-in Token
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Instant ticket generation
              </div>
            </div>
          </div>
          <ArrowUpRight size={16} color="var(--primary)" />
        </div>

        {/* Register Patient */}
        <div
          onClick={onRegisterPatient}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--blue-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--blue-bg)',
                border: '1px solid var(--blue-border)',
                color: 'var(--blue-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                New Patient Intake
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Comprehensive registration
              </div>
            </div>
          </div>
          <ArrowUpRight size={16} color="var(--blue-accent)" />
        </div>

        {/* Doctor Station */}
        <div
          onClick={onDoctorStation}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--green-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                color: 'var(--green-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Doctor Station
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Consultation & Prescriptions
              </div>
            </div>
          </div>
          <ArrowUpRight size={16} color="var(--green-accent)" />
        </div>

        {/* Pharmacy Desk */}
        <div
          onClick={onPharmacyDesk}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--purple-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--purple-bg)',
                border: '1px solid var(--purple-border)',
                color: 'var(--purple-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pill size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Pharmacy Dispensing
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                FEFO batch fulfillment
              </div>
            </div>
          </div>
          <ArrowUpRight size={16} color="var(--purple-accent)" />
        </div>
      </div>
    </div>
  );
};
