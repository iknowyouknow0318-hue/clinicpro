import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Pill, 
  Package, 
  BarChart3, 
  LayoutDashboard, 
  Zap, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Tv,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { language, t, getLocalized } = useLanguage();
  const location = useLocation();

  const navItem = (to: string, icon: React.ReactNode, label: string, badge?: string) => {
    const isActive = location.pathname === to;
    return (
      <NavLink
        to={to}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.85rem',
          borderRadius: 'var(--radius)',
          color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
          background: isActive ? 'var(--primary-bg-strong)' : 'transparent',
          border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
          textDecoration: 'none',
          fontSize: '0.83rem',
          fontWeight: isActive ? 700 : 500,
          marginBottom: '0.15rem',
          transition: 'all 0.18s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--bg-card-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
          }}>
            {icon}
          </span>
          <span>{label}</span>
        </div>
        {badge && (
          <span style={{
            background: isActive ? 'var(--primary)' : 'var(--primary-bg)',
            color: isActive ? '#fff' : 'var(--primary)',
            fontSize: '0.6rem',
            padding: '0.12rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            border: isActive ? 'none' : '1px solid var(--primary-border)',
            minWidth: '20px',
            textAlign: 'center',
          }}>
            {badge}
          </span>
        )}
        {isActive && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '60%',
            borderRadius: '0 3px 3px 0',
            background: 'var(--primary-gradient)',
          }} />
        )}
      </NavLink>
    );
  };

  const sectionHeader = (label: string) => (
    <div style={{
      fontSize: '0.63rem',
      fontWeight: 700,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '0 0.65rem',
      marginBottom: '0.45rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <span>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-light)', marginTop: '1px' }} />
    </div>
  );

  const role = user?.role || 'RECEPTIONIST';

  return (
    <aside style={{
      width: '252px',
      background: 'var(--bg-sidebar)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.25rem 0.8rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      overflowY: 'auto',
      minHeight: 'calc(100vh - 64px)',
    }}>
      {/* Patient Specific Navigation */}
      {role === 'PATIENT' && (
        <>
          <div>
            {sectionHeader(getLocalized('Patient Experience', 'நோயாளி போர்டல்', 'मरीज अनुभव'))}
            {navItem('/patient-portal', <LayoutDashboard size={16} />, getLocalized('My Portal & Queue', 'எனது போர்டல் & வரிசை', 'मेरा पोर्टल और कतार'))}
            {navItem('/find-doctors', <Search size={16} />, getLocalized('Find & Book Doctor', 'மருத்துவர் முன்பதிவு', 'डॉक्टर खोजें व बुक करें'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Public Display', 'நேரலை திரை', 'सार्वजनिक डिस्प्ले'))}
            {navItem('/public-display', <Tv size={16} />, getLocalized('Waiting Hall Display', 'காத்திருப்பு அறை திரை', 'प्रतीक्षा कक्ष डिस्प्ले'))}
          </div>
        </>
      )}

      {/* Doctor Specific Navigation */}
      {role === 'DOCTOR' && (
        <>
          <div>
            {sectionHeader(getLocalized('Clinical Station', 'மருத்துவர் நிலையம்', 'क्लिनिकल स्टेशन'))}
            {navItem('/doctor', <Stethoscope size={16} />, getLocalized('Doctor Station & Queue', 'மருத்துவர் தளம் & வரிசை', 'डॉक्टर स्टेशन व कतार'))}
            {navItem('/appointments', <Calendar size={16} />, getLocalized('My Schedule', 'அட்டவணை', 'मेरी अनुसूची'))}
            {navItem('/queue', <Clock size={16} />, getLocalized('Live Outpatient Queue', 'நேரலை வரிசை', 'लाइव ओपीडी कतार'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Consultations', 'ஆலோசனை & மருந்து', 'परामर्श व पर्चा'))}
            {navItem('/consultation', <FileText size={16} />, getLocalized('Consultations', 'ஆலோசனை படிவம்', 'परामर्श प्रपत्र'))}
            {navItem('/prescriptions', <FileText size={16} />, getLocalized('Prescription Builder', 'மருந்து சீட்டு உருவாக்கி', 'पर्चा निर्माता'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Public Display', 'காத்திருப்பு திரை', 'सार्वजनिक डिस्प्ले'))}
            {navItem('/public-display', <Tv size={16} />, getLocalized('Waiting TV Display', 'காத்திருப்பு திரை', 'प्रतीक्षा टीवी डिस्प्ले'))}
          </div>
        </>
      )}

      {/* Triage Nurse Specific Navigation */}
      {role === 'TRIAGE_NURSE' && (
        <>
          <div>
            {sectionHeader(getLocalized('Triage & Priority Desk', 'அவசர சிகிச்சை பிரிவு', 'ट्राइएज व प्राथमिकता डेस्क'))}
            {navItem('/reception', <ShieldAlert size={16} />, getLocalized('Emergency Triage Desk', 'அவசர முன்னுரிமை மையம்', 'आपातकालीन ट्राइएज डेस्क'))}
            {navItem('/queue', <Clock size={16} />, getLocalized('Live Clinic Queue', 'நேரலை வரிசை', 'लाइव क्लीनिक कतार'))}
            {navItem('/register-patient', <UserPlus size={16} />, getLocalized('New Patient Registration', 'புதிய நோயாளி', 'नया मरीज पंजीकरण'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Public Display', 'காத்திருப்பு திரை', 'सार्वजनिक डिस्प्ले'))}
            {navItem('/public-display', <Tv size={16} />, getLocalized('Waiting TV Display', 'காத்திருப்பு திரை', 'प्रतीक्षा टीवी डिस्प्ले'))}
          </div>
        </>
      )}

      {/* Receptionist Navigation */}
      {role === 'RECEPTIONIST' && (
        <>
          <div>
            {sectionHeader(getLocalized('Front Desk Reception', 'முன் மேஜை', 'फ्रंट डेस्क रिसेप्शन'))}
            {navItem('/reception', <LayoutDashboard size={16} />, getLocalized('Check-In & Reception', 'வரவேற்பு & வருகை பதிவு', 'चेक-इन और रिसेप्शन'))}
            {navItem('/register-patient', <UserPlus size={16} />, getLocalized('Register New Patient', 'புதிய நோயாளி பதிவு', 'नया मरीज पंजीकृत करें'))}
            {navItem('/appointments', <Calendar size={16} />, getLocalized('Appointments', 'முன்பதிவுகள்', 'अपॉइंटमेंट्स'))}
            {navItem('/find-doctors', <Search size={16} />, getLocalized('Doctor Directory', 'மருத்துவர் வழிகாட்டி', 'डॉक्टर निर्देशिका'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Live Queue', 'வரிசை கண்காணிப்பு', 'लाइव कतार'))}
            {navItem('/queue', <Clock size={16} />, getLocalized('Queue Board', 'நேரலை வரிசை', 'कतार बोर्ड'))}
            {navItem('/public-display', <Tv size={16} />, getLocalized('Waiting TV Display', 'காத்திருப்பு திரை', 'प्रतीक्षा टीवी डिस्प्ले'))}
          </div>
        </>
      )}

      {/* Pharmacy Navigation */}
      {role === 'PHARMACY' && (
        <>
          <div>
            {sectionHeader(getLocalized('Pharmacy Station', 'மருந்தகம்', 'फार्मेसी स्टेशन'))}
            {navItem('/pharmacy', <Pill size={16} />, getLocalized('Prescription Validation', 'மருந்து சரிபார்ப்பு', 'पर्चा सत्यापन'))}
            {navItem('/inventory', <Package size={16} />, getLocalized('Medicine Inventory', 'மருந்து இருப்பு', 'दवा सूची (इन्वेंट्री)'))}
          </div>
        </>
      )}

      {/* Administrator Navigation */}
      {role === 'ADMIN' && (
        <>
          <div>
            {sectionHeader(getLocalized('Administration', 'நிர்வாக மையம்', 'प्रशासन'))}
            {navItem('/intelligence', <BarChart3 size={16} />, getLocalized('Clinic Analytics', 'பகுப்பாய்வு & அளவீடுகள்', 'क्लीनिक विश्लेषण'))}
            {navItem('/audit-logs', <ShieldCheck size={16} />, getLocalized('Audit & Security Logs', 'பாதுகாப்பு & தணிக்கை', 'ऑडिट व सुरक्षा लॉग्स'))}
            {navItem('/reception', <LayoutDashboard size={16} />, getLocalized('Reception Desk', 'வரவேற்பு மேஜை', 'रिसेप्शन डेस्क'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Clinical Portals', 'மருத்துவ மேலாண்மை', 'क्लिनिकल पोर्टल्स'))}
            {navItem('/doctor', <Stethoscope size={16} />, getLocalized('Doctor Station', 'மருத்துவர் நிலையம்', 'डॉक्टर स्टेशन'))}
            {navItem('/queue', <Clock size={16} />, getLocalized('Live Queue Monitor', 'நேரலை வரிசை', 'लाइव कतार मॉनिटर'))}
            {navItem('/pharmacy', <Pill size={16} />, getLocalized('Pharmacy Dispensing', 'மருந்தகம்', 'फार्मेसी वितरण'))}
            {navItem('/register-patient', <UserPlus size={16} />, getLocalized('New Patient', 'நோயாளி பதிவு', 'नया मरीज'))}
          </div>
          <div>
            {sectionHeader(getLocalized('Waiting Display', 'காத்திருப்பு திரை', 'प्रतीक्षा डिस्प्ले'))}
            {navItem('/public-display', <Tv size={16} />, getLocalized('Waiting TV Display', 'பொது காத்திருப்பு திரை', 'प्रतीक्षा टीवी डिस्प्ले'))}
          </div>
        </>
      )}

      {/* Footer Branding Card */}
      <div style={{
        marginTop: 'auto',
        padding: '0.85rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--primary-gradient-soft)',
        border: '1px solid var(--primary-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <Zap size={13} color="var(--primary)" />
          <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.78rem' }}>
            SmartCare OPD
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
          Kovilpatti Outpatient Clinic System
        </div>
      </div>
    </aside>
  );
};
