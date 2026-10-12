import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Shield, 
  LogOut, 
  Clock, 
  Sun, 
  Moon, 
  Sparkles, 
  Building2, 
  ChevronDown,
  Globe,
  Tv,
  Stethoscope
} from 'lucide-react';
import { notificationService, Notification, doctorService, patientService } from '../api/services';
import { CommandMenu } from './shadcn/CommandMenu';
import { QuickTokenModal } from './templates/QuickTokenModal';
import { Badge } from './shadcn/Badge';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t, getLocalized } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('clinic_theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  // Global Command Menu and Quick Token Modal
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [quickTokenOpen, setQuickTokenOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for open-command-menu custom event
  useEffect(() => {
    const handleOpen = () => setCommandMenuOpen(true);
    window.addEventListener('open-command-menu', handleOpen);
    return () => window.removeEventListener('open-command-menu', handleOpen);
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clinic_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clinic_theme', 'light');
    }
  }, [isDarkMode]);

  // Load patients and doctors for the quick token modal
  useEffect(() => {
    if (user && user.role !== 'PATIENT') {
      Promise.all([
        patientService.getAll().catch(() => []),
        doctorService.getAll().catch(() => []),
      ]).then(([pList, dList]) => {
        if (pList) setPatients(pList);
        if (dList) setDoctors(dList);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'PATIENT') {
      notificationService.getUnreadByPatient(user.userId)
        .then(data => setNotifications(data || []))
        .catch(() => {});
    }
  }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'DOCTOR': return 'teal';
      case 'PHARMACY': return 'purple';
      case 'ADMIN': return 'info';
      case 'TRIAGE_NURSE': return 'destructive';
      case 'PATIENT': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <>
      <header style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-navbar)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
      }}>
        {/* Left: Brand & Clinic Facility Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={() => {
              if (user?.role === 'PATIENT') navigate('/patient-portal');
              else if (user?.role === 'DOCTOR') navigate('/doctor');
              else if (user?.role === 'PHARMACY') navigate('/pharmacy');
              else if (user?.role === 'ADMIN') navigate('/intelligence');
              else navigate('/reception');
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              color: '#fff',
            }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                  SmartCare
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-bg)',
                  color: 'var(--primary-dark)',
                  marginLeft: '0.25rem',
                  letterSpacing: '0.05em',
                }}>
                  OPD
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1, fontWeight: 500 }}>
                {t('tagline')}
              </div>
            </div>
          </div>

          {/* Facility Location Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}>
            <Building2 size={13} color="var(--primary)" />
            <span>SmartCare Medical Centre, Kovilpatti</span>
          </div>
        </div>

        {/* Right: Actions, Language, TV Display, Clock & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Waiting TV Display Quick Link */}
          <Link
            to="/public-display"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.38rem 0.75rem',
              borderRadius: 'var(--radius)',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Tv size={14} color="var(--primary)" />
            <span>{getLocalized('TV Queue Display', 'காத்திருப்பு திரை', 'टीवी कतार डिस्प्ले')}</span>
          </Link>

          {/* Multilingual Selector */}
          <LanguageSelector variant="button" />

          {/* Current Time Clock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            padding: '0.35rem 0.6rem',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
          }}>
            <Clock size={13} />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isDarkMode ? <Sun size={16} color="var(--amber-accent)" /> : <Moon size={16} />}
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.25rem 0.35rem 0.25rem 0.65rem',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)} style={{ fontSize: '0.62rem', padding: '0.05rem 0.4rem' }}>
                  {user.role}
                </Badge>
              </div>

              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red-dark)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Command Launcher */}
      <CommandMenu
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
        onQuickToken={() => setQuickTokenOpen(true)}
      />

      {/* Global Quick Walk-in Token Modal */}
      <QuickTokenModal
        isOpen={quickTokenOpen}
        onClose={() => setQuickTokenOpen(false)}
        patients={patients}
        doctors={doctors}
        onTokenGenerated={() => {
          window.dispatchEvent(new CustomEvent('clinic-data-refresh'));
        }}
      />
    </>
  );
};
