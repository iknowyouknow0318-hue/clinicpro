import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Copy, Check, X, Zap, Smartphone } from 'lucide-react';

interface SmsPayload {
  phone: string;
  formattedPhone: string;
  otp: string;
  message: string;
  timestamp: string;
  sender: string;
}

export const PhoneMessageBanner: React.FC = () => {
  const [currentSms, setCurrentSms] = useState<SmsPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<any>(null);

  // Play realistic subtle phone message chime (Web Audio API)
  const playSmsChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // First beep: 784 Hz (G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second beep: 1046 Hz (C6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    } catch {
      // Audio not permitted without user interaction, ignore
    }
  };

  useEffect(() => {
    const handleIncomingSms = (e: any) => {
      const payload: SmsPayload = e.detail;
      setCurrentSms(payload);
      setVisible(true);
      setCopied(false);
      playSmsChime();

      if (timerRef.current) clearTimeout(timerRef.current);
      // Auto-hide after 18 seconds
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 18000);
    };

    window.addEventListener('phone-sms-received', handleIncomingSms as EventListener);
    return () => {
      window.removeEventListener('phone-sms-received', handleIncomingSms as EventListener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !currentSms) return null;

  const handleCopy = () => {
    if (!currentSms) return;
    navigator.clipboard.writeText(currentSms.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAutoFill = () => {
    if (!currentSms) return;
    window.dispatchEvent(new CustomEvent('phone-otp-autofill', { detail: { otp: currentSms.otp } }));
    setVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: '92%',
        maxWidth: '480px',
        animation: 'slideDownPhone 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes slideDownPhone {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          padding: '14px 16px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #0284c7, #38bdf8, #10b981)',
          }}
        />

        {/* Message Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <MessageSquare size={14} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
                  Phone Message • SIM 1
                </span>
                <span
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    fontSize: '0.6rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  LIVE SMS
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
              {currentSms.timestamp}
            </span>
            <button
              onClick={() => setVisible(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sender & Body */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>
            {currentSms.sender}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            SmartCare Verification OTP: <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#38bdf8', letterSpacing: '2px', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>{currentSms.otp}</span>. Valid for 10 minutes.
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
            To: {currentSms.formattedPhone} • Do not disclose this passcode to anyone.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button
            onClick={handleAutoFill}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
          >
            <Zap size={13} />
            <span>Auto-Fill OTP ({currentSms.otp})</span>
          </button>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: copied ? '#10b981' : '#f1f5f9',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
