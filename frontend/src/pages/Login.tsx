import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  UserCheck, 
  Stethoscope, 
  ClipboardList, 
  AlertCircle, 
  Sparkles, 
  KeyRound, 
  Tv, 
  Building2, 
  HeartHandshake,
  CheckCircle2,
  Globe,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { phoneOtpService } from '../api/phoneOtpService';

export const Login: React.FC = () => {
  const { login, loginPatientOtp } = useAuth();
  const { language, toggleLanguage, t, getLocalized } = useLanguage();
  const navigate = useNavigate();

  // Tab: 'PATIENT' | 'STAFF'
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'STAFF'>('PATIENT');

  // Patient OTP State
  const [patientPhone, setPatientPhone] = useState('9840123450');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Staff Credentials State
  const [staffEmail, setStaffEmail] = useState('doctor.arun@smartcare.demo');
  const [staffPassword, setStaffPassword] = useState('Doctor@123');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Listen for auto-fill event from phone message banner
  useEffect(() => {
    const handleAutoFill = (e: any) => {
      if (e.detail?.otp) {
        setEnteredOtp(e.detail.otp);
      }
    };
    window.addEventListener('phone-otp-autofill', handleAutoFill);
    return () => window.removeEventListener('phone-otp-autofill', handleAutoFill);
  }, []);

  // Quick 1-Click Demo Accounts
  const DEMO_STAFF_ACCOUNTS = [
    {
      role: 'ADMIN',
      title: getLocalized('Administrator', 'நிர்வாகி', 'व्यवस्थापक (एडमिन)'),
      name: 'System Admin',
      email: 'admin@smartcare.demo',
      password: 'Admin@123',
      color: '#0284c7',
      icon: <Shield size={18} />,
      badge: 'ADMIN',
      desc: getLocalized(
        'Full system, clinics, analytics & audit logs',
        'அனைத்து கிளினிக் & தணிக்கை கட்டுப்பாடு',
        'सम्पूर्ण सिस्टम, क्लीनिक, विश्लेषण और ऑडिट लॉग्स'
      )
    },
    {
      role: 'DOCTOR',
      title: getLocalized('Doctor (General Medicine)', 'மருத்துவர்', 'डॉक्टर (सामान्य चिकित्सा)'),
      name: 'Dr. Arun Kumar',
      email: 'doctor.arun@smartcare.demo',
      password: 'Doctor@123',
      color: '#0284c7',
      icon: <Stethoscope size={18} />,
      badge: 'DOCTOR',
      desc: getLocalized(
        'Live queue, consultations & digital prescriptions',
        'நோயாளி ஆலோசனை, டிஜிட்டல் மருந்து சீட்டு',
        'लाइव ओपीडी कतार, परामर्श और डिजिटल पर्चा'
      )
    },
    {
      role: 'RECEPTIONIST',
      title: getLocalized('Receptionist (Front Desk)', 'வரவேற்பாளர்', 'रिसेप्शनिस्ट (फ्रंट डेस्क)'),
      name: 'Meera Nair',
      email: 'reception@smartcare.demo',
      password: 'Reception@123',
      color: '#8b5cf6',
      icon: <ClipboardList size={18} />,
      badge: 'RECEPTION',
      desc: getLocalized(
        'QR check-in, token issue & queue monitor',
        'வருகை பதிவு, QR ஸ்கேன் & டோக்கன் மேலாண்மை',
        'क्यूआर चेक-इन, टोकन वितरण व कतार प्रबंधन'
      )
    },
    {
      role: 'TRIAGE_NURSE',
      title: getLocalized('Triage Nurse (Urgent Care)', 'அவசர சிகிச்சை செவிலியர்', 'ट्राइएज नर्स (आपातकालीन)'),
      name: 'Sister Mary V',
      email: 'triage@smartcare.demo',
      password: 'Triage@123',
      color: '#ef4444',
      icon: <Activity size={18} />,
      badge: 'TRIAGE',
      desc: getLocalized(
        'Clinical emergency & priority queue overrides',
        'அவசர நிலை முன்னுரிமை மாற்றம்',
        'आपातकालीन ट्राइएज और प्राथमिकता बदलाव'
      )
    },
    {
      role: 'PHARMACY',
      title: getLocalized('Pharmacist', 'மருந்தாளுநர்', 'फार्मासिस्ट'),
      name: 'Kavitha Reddy',
      email: 'pharmacy@smartcare.demo',
      password: 'Pharmacy@123',
      color: '#10b981',
      icon: <HeartHandshake size={18} />,
      badge: 'PHARMACY',
      desc: getLocalized(
        'Prescription verification & dispense',
        'மருந்து சீட்டு சரிபார்ப்பு & வழங்கல்',
        'पर्चा सत्यापन और औषधि वितरण'
      )
    },
  ];

  const handleSendOtp = async () => {
    const clean = patientPhone.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg(getLocalized(
        'Please enter a valid 10-digit mobile number',
        'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
        'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें'
      ));
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await phoneOtpService.sendOtp(patientPhone);
      setOtpSent(true);
      setSimulatedOtp(res.otp);
      setEnteredOtp(''); // Intentionally empty so user sees the phone message code
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch OTP phone message');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginPatientOtp(patientPhone, enteredOtp);
      navigate('/patient-portal');
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const emailToUse = customEmail || staffEmail;
    const passToUse = customPass || staffPassword;

    try {
      const loggedUser = await login(emailToUse, passToUse);
      if (loggedUser.role === 'DOCTOR') navigate('/doctor');
      else if (loggedUser.role === 'RECEPTIONIST') navigate('/reception');
      else if (loggedUser.role === 'TRIAGE_NURSE') navigate('/reception');
      else if (loggedUser.role === 'PHARMACY') navigate('/pharmacy');
      else if (loggedUser.role === 'ADMIN') navigate('/intelligence');
      else navigate('/patient-portal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickStaffLogin = (acc: typeof DEMO_STAFF_ACCOUNTS[0]) => {
    setStaffEmail(acc.email);
    setStaffPassword(acc.password);
    handleStaffLogin(undefined, acc.email, acc.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
    }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                {t('appName')}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--primary-border)',
              }}>
                SECURE OPD
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {t('tagline')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/public-display"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Tv size={15} color="#0d9488" />
            <span>{getLocalized('Waiting TV Display', 'காத்திருப்பு திரை', 'प्रतीक्षा टीवी डिस्प्ले')}</span>
          </Link>

          <LanguageSelector variant="button" />
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: activeTab === 'STAFF' ? '860px' : '480px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(13, 148, 136, 0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}>
          {/* Role Tabs Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}>
            <button
              onClick={() => { setActiveTab('PATIENT'); setErrorMsg(null); }}
              style={{
                padding: '1rem',
                border: 'none',
                background: activeTab === 'PATIENT' ? '#ffffff' : 'transparent',
                color: activeTab === 'PATIENT' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'PATIENT' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderBottom: activeTab === 'PATIENT' ? '2px solid var(--primary)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <UserCheck size={18} />
              <span>{getLocalized('Patient Portal (OTP)', 'நோயாளி போர்டல் (OTP)', 'मरीज पोर्टल (ओटीपी)')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('STAFF'); setErrorMsg(null); }}
              style={{
                padding: '1rem',
                border: 'none',
                background: activeTab === 'STAFF' ? '#ffffff' : 'transparent',
                color: activeTab === 'STAFF' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'STAFF' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderBottom: activeTab === 'STAFF' ? '2px solid var(--primary)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Stethoscope size={18} />
              <span>{getLocalized('Hospital Staff Login', 'மருத்துவ பணியாளர் உள்நுழைவு', 'अस्पताल स्टाफ लॉगिन')}</span>
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Error Notification */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}>
                <AlertCircle size={17} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: PATIENT PORTAL OTP LOGIN */}
            {activeTab === 'PATIENT' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>
                    {getLocalized('Patient Instant Access', 'பாதுகாப்பான நோயாளி சரிபார்ப்பு', 'मरीज त्वरित प्रवेश')}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {getLocalized(
                      'Login with verified mobile number to view token, live queue, and digital prescription',
                      'டோக்கன், நேரலை வரிசை மற்றும் டிஜிட்டல் மருந்து சீட்டுக்கான மொபைல் OTP',
                      'टोकन, लाइव कतार और डिजिटल पर्चा देखने के लिए सत्यापित मोबाइल नंबर से लॉगिन करें'
                    )}
                  </p>
                </div>

                {/* Phone OTP Mode Indicator */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(8, 145, 178, 0.06) 100%)',
                  border: '1px dashed var(--primary)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={18} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {getLocalized('Phone Message OTP Verification', 'போன் மெசேஜ் OTP சரிபார்ப்பு', 'फोन संदेश ओटीपी सत्यापन')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {getLocalized(
                          'OTP is dispatched directly to incoming phone messages',
                          'OTP நேரடியாக உங்கள் போன் மெசேஜுக்கு அனுப்பப்படும்',
                          'ओटीपी सीधे आपके आने वाले फोन संदेश पर भेजा जाता है'
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}>
                    SMS VERIFIED
                  </div>
                </div>

                {!otpSent ? (
                  <div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                        {getLocalized('Mobile Phone Number (10 Digits)', 'மொபைல் எண் (10 இலக்கங்கள்)', 'मोबाइल नंबर (10 अंक)')}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}>
                          +91
                        </div>
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="9840123450"
                          maxLength={10}
                          style={{
                            width: '100%',
                            padding: '0.75rem 0.85rem 0.75rem 2.8rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-mono)',
                            boxSizing: 'border-box',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        background: 'var(--primary-gradient)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                      }}
                    >
                      <Smartphone size={16} />
                      <span>{loading ? 'Sending...' : getLocalized('Send OTP to Phone Message', 'போனுக்கு OTP அனுப்புக', 'फोन संदेश पर ओटीपी भेजें')}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePatientVerify}>
                    {/* Feedback Alert for Sent SMS */}
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                    }}>
                      <Smartphone size={22} color="#16a34a" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>
                          {getLocalized('OTP Sent to Phone Message!', 'போன் மெசேஜுக்கு OTP அனுப்பப்பட்டது!', 'फोन संदेश पर ओटीपी भेजा गया!')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px', lineHeight: 1.35 }}>
                          {getLocalized(
                            `Check the incoming phone message banner at top of screen for +91 ${patientPhone}.`,
                            `திரையின் மேற்பகுதியில் உள்ள +91 ${patientPhone} போன் மெசேஜ் அறிவிப்பைப் பார்க்கவும்.`,
                            `स्क्रीन के शीर्ष पर +91 ${patientPhone} के लिए आने वाले फोन संदेश को देखें।`
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                          {getLocalized('Verification Code (OTP from Phone)', 'சரிபார்ப்பு குறியீடு (OTP)', 'सत्यापन कोड (फोन से ओटीपी)')}
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {getLocalized('Change number', 'எண்ணை மாற்று', 'नंबर बदलें')}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="••••••"
                        maxLength={6}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--primary)',
                          borderRadius: '8px',
                          fontSize: '1.35rem',
                          textAlign: 'center',
                          letterSpacing: '0.35em',
                          fontWeight: 800,
                          boxSizing: 'border-box',
                          outline: 'none',
                          background: '#fafafa',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {getLocalized('Enter 6-digit code received', 'வந்த 6 இலக்க குறியீட்டை உள்ளிடவும்', 'प्राप्त 6 अंकों का कोड दर्ज करें')}
                        </span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <RefreshCw size={11} />
                          <span>{getLocalized('Resend OTP', 'மீண்டும் அனுப்புக', 'पुनः ओटीपी भेजें')}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        background: 'var(--primary-gradient)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{loading ? 'Verifying...' : getLocalized('Verify & Enter Patient Portal', 'சரிபார்த்து நுழைக', 'सत्यापित करें और मरीज पोर्टल में प्रवेश करें')}</span>
                    </button>
                  </form>
                )}

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <Link
                    to="/register-patient"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      textDecoration: 'none',
                    }}
                  >
                    {getLocalized('New Patient? Register Profile & Consent →', 'புதிய நோயாளியா? பதிவு செய்து ஒப்புதல் அளிக்கவும் →', 'नया मरीज? पंजीकरण व सहमति दर्ज करें →')}
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: HOSPITAL STAFF DEMO CARDS & LOGIN */}
            {activeTab === 'STAFF' && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>
                    {getLocalized('Hospital Healthcare Team Station', 'மருத்துவமனை பணியாளர் தளம்', 'अस्पताल चिकित्सा टीम स्टेशन')}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {getLocalized(
                      'Select any role below for instant 1-click evaluation or sign in with your hospital credentials',
                      'மதிப்பீட்டிற்காக கீழே உள்ள எந்தவொரு பாத்திரத்தையும் ஒரே கிளிக்கில் தேர்ந்தெடுக்கவும்',
                      'त्वरित 1-क्लिक परीक्षण के लिए नीचे किसी भी भूमिका का चयन करें या क्रेडेंशियल से लॉगिन करें'
                    )}
                  </p>
                </div>

                {/* 1-Click Role Accounts Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1.75rem',
                }}>
                  {DEMO_STAFF_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.email}
                      onClick={() => quickStaffLogin(acc)}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = acc.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 6px 16px ${acc.color}22`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: `${acc.color}18`,
                            color: acc.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {acc.icon}
                          </div>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            background: `${acc.color}15`,
                            color: acc.color,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            letterSpacing: '0.04em',
                          }}>
                            {acc.badge}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)', marginBottom: '0.15rem' }}>
                          {acc.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          {acc.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {acc.desc}
                        </div>
                      </div>

                      <div style={{
                        marginTop: '0.85rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: acc.color,
                        fontWeight: 700,
                      }}>
                        <span>1-Click Sign In</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual Credentials Form */}
                <div style={{
                  padding: '1.25rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {getLocalized('Or Sign In with Staff Email & Password', 'கைமுறை மின்னஞ்சல் மற்றும் கடவுச்சொல்', 'या स्टाफ ईमेल और पासवर्ड से साइन इन करें')}
                  </div>

                  <form onSubmit={handleStaffLogin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.3rem' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="doctor.arun@smartcare.demo"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.3rem' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Doctor@123"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: 'var(--text-heading)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {loading ? getLocalized('Signing in...', 'உள்நுழைகிறது...', 'लॉगिन हो रहा है...') : getLocalized('Sign In', 'உள்நுழைக', 'साइन इन')}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer style={{
        padding: '1rem 2rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'rgba(255, 255, 255, 0.6)',
      }}>
        SmartCare Outpatient System • SmartCare Medical Centre, Kovilpatti • No autonomous medical decision-making • Clinical judgment preserved
      </footer>
    </div>
  );
};
