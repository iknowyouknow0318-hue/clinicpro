import React, { useState, useEffect } from 'react';
import { smartcareStore } from '../api/smartcareStore';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Lock, 
  Sparkles,
  ArrowRight,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { phoneOtpService } from '../api/phoneOtpService';

export const PatientRegistration: React.FC = () => {
  const { language, t, getLocalized } = useLanguage();
  const navigate = useNavigate();

  // Step 1: Mobile & OTP Verification
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 2: Demographics & Clinical Profile
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1994-08-16');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('Kovilpatti, Tamil Nadu');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [preferredLang, setPreferredLang] = useState<'en' | 'ta' | 'hi'>(language);
  const [preferredChannel, setPreferredChannel] = useState<'WHATSAPP' | 'SMS' | 'APP'>('SMS');

  // Listen for auto-fill from phone message banner
  useEffect(() => {
    const handleAutoFill = (e: any) => {
      if (e.detail?.otp) {
        setOtpCode(e.detail.otp);
      }
    };
    window.addEventListener('phone-otp-autofill', handleAutoFill);
    return () => window.removeEventListener('phone-otp-autofill', handleAutoFill);
  }, []);

  // Step 3: Granular Consent
  const [consent, setConsent] = useState({
    appointmentCommunication: true,
    queueNotifications: true,
    messagingChannels: true,
    prescriptionDelivery: true,
    pharmacySharing: true,
  });

  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const clean = mobile.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      alert(getLocalized(
        'Please enter a valid 10-digit mobile number.',
        'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
        'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
      ));
      return;
    }
    setLoading(true);
    try {
      await phoneOtpService.sendOtp(mobile);
      setOtpSent(true);
      setOtpCode('');
    } catch (e: any) {
      alert(e.message || 'Failed to dispatch phone message OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    const res = phoneOtpService.verifyOtp(mobile, otpCode);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setOtpVerified(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      alert('Mobile number verification required prior to profile registration.');
      return;
    }

    setLoading(true);
    const allergiesList = allergiesInput
      ? allergiesInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newPatient = smartcareStore.registerPatient({
      name,
      phone: mobile,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@patient.smartcare.demo`,
      dob,
      gender,
      bloodGroup,
      address,
      allergies: allergiesList,
      preferredLanguage: preferredLang,
      preferredNotification: preferredChannel,
      consent: {
        ...consent,
        updatedAt: new Date().toLocaleString(),
      },
    });

    setSuccessNotice(`Registration & Consent recorded for ${newPatient.name} (ID #${newPatient.id})`);
    setTimeout(() => {
      navigate('/patient-portal');
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '840px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={20} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            {language === 'ta' ? 'புதிய நோயாளி பதிவு & ஒப்புதல் படிவம்' : 'Patient Registration & Consent Capture'}
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          {language === 'ta' 
            ? 'மொபைல் OTP சரிபார்ப்பு, மருத்துவ விவரங்கள் மற்றும் தனித்தனி டிஜிட்டல் ஒப்புதல்'
            : 'Verified registration, patient demographics, clinical allergies, and granular communication consent.'}
        </p>
      </div>

      {successNotice && (
        <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        {/* SECTION 1: MOBILE & OTP VERIFICATION */}
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            SECTION 1: MOBILE IDENTITY & OTP VERIFICATION
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                MOBILE NUMBER (10 DIGITS)
              </label>
              <input
                type="tel"
                placeholder="9840199999"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={otpVerified}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    padding: '0.7rem 1.25rem',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Send Verification OTP
                </button>
              ) : !otpVerified ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    style={{ width: '110px', padding: '0.7rem', borderRadius: '8px', border: '2px solid var(--primary)', textAlign: 'center', fontWeight: 800, letterSpacing: '0.2em' }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    style={{ padding: '0.7rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Verify OTP
                  </button>
                </div>
              ) : (
                <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '42px' }}>
                  <CheckCircle2 size={16} />
                  <span>Verified via Phone Message OTP</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: DEMOGRAPHICS */}
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            SECTION 2: PATIENT DEMOGRAPHICS & CLINICAL ALERTS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                FULL NAME (முழு பெயர்) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subbulakshmi Raman"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                DATE OF BIRTH (பிறந்த தேதி) *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                GENDER (பாலினம்)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                BLOOD GROUP
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                PREFERRED LANGUAGE
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                PRIMARY NOTIFICATION CHANNEL
              </label>
              <select
                value={preferredChannel}
                onChange={(e) => setPreferredChannel(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="WHATSAPP">WhatsApp Messenger</option>
                <option value="SMS">SMS Text Message</option>
                <option value="APP">In-App Push</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.35rem' }}>
              KNOWN DRUG ALLERGIES (மருந்து ஒவ்வாமை - கமாவால் பிரிக்கவும்)
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Sulfa, Aspirin"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* SECTION 3: SEPARATE GRANULAR CONSENT CHECKBOXES */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            SECTION 3: CONCISE PRIVACY & NOTIFICATION CONSENT (தனித்தனி ஒப்புதல்)
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
            In accordance with digital healthcare data protection principles, please indicate your consent for each outpatient operational process.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { key: 'appointmentCommunication', title: '1. Appointment & Booking Communication', desc: 'Receive booking confirmation, time slot allocation, and schedule updates.' },
              { key: 'queueNotifications', title: '2. Live Queue Calling Notifications', desc: 'Receive real-time alerts when your token is called to proceed to the consultation room.' },
              { key: 'messagingChannels', title: '3. Multi-Channel Messaging (WhatsApp / SMS / App)', desc: 'Deliver token updates to verified mobile number without medical details in preview.' },
              { key: 'prescriptionDelivery', title: '4. Secure Digital Prescription Delivery', desc: 'Generate encrypted, identity-authenticated access link for your consultation document.' },
              { key: 'pharmacySharing', title: '5. Optional Pharmacy Sharing', desc: 'Allow verified in-house clinic pharmacy to view your prescription for dispensing.' },
            ].map((c) => (
              <label
                key={c.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={(consent as any)[c.key]}
                  onChange={(e) => setConsent({ ...consent, [c.key]: e.target.checked })}
                  style={{ marginTop: '0.2rem', transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !otpVerified}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: otpVerified ? 'pointer' : 'not-allowed',
            opacity: otpVerified ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
          }}
        >
          <ShieldCheck size={18} />
          <span>Complete Registration & Save Consent (பதிவை முடித்து ஒப்புதல் அளிக்கவும்)</span>
        </button>
      </form>
    </div>
  );
};
