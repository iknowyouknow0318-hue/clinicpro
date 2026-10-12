import React, { useState, useEffect } from 'react';
import { smartcareStore, QueueEntry, Doctor } from '../api/smartcareStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Building2,
  Tv,
  Globe
} from 'lucide-react';

import { LanguageSelector } from '../components/LanguageSelector';

export const PublicDisplay: React.FC = () => {
  const { language, toggleLanguage, t, getLocalized } = useLanguage();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastCalledToken, setLastCalledToken] = useState<string | null>(null);
  const [chimePlaying, setChimePlaying] = useState(false);

  // Play audio chime synthesized with Web Audio API (No external file needed!)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // Note 1: E5 (659 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.value = 659.25;
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2: B5 (987 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.value = 987.77;
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      gain2.gain.setValueAtTime(0.3, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.9);

      setChimePlaying(true);
      setTimeout(() => setChimePlaying(false), 2000);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  useEffect(() => {
    const updateData = () => {
      const q = smartcareStore.getActiveQueueSorted();
      setQueue(q);
      setDoctors(smartcareStore.getDoctors());

      const called = q.find(entry => entry.queueStatus === 'CALLED');
      if (called && called.tokenNumber !== lastCalledToken) {
        setLastCalledToken(called.tokenNumber);
        playChime();
      }
    };

    updateData();
    const unsub = smartcareStore.subscribe(updateData);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      unsub();
      clearInterval(clockTimer);
    };
  }, [lastCalledToken, soundEnabled]);

  const currentlyServing = queue.find(q => q.queueStatus === 'IN_CONSULTATION') || queue.find(q => q.queueStatus === 'CALLED');
  const calledEntry = queue.find(q => q.queueStatus === 'CALLED');
  const waitingEntries = queue.filter(q => q.queueStatus === 'WAITING').slice(0, 8);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #091e2f 0%, #0c2d3e 50%, #061923 100%)',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      boxSizing: 'border-box',
    }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.75rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)',
          }}>
            <Shield size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
                SmartCare
              </span>
              <span style={{
                background: 'rgba(13, 148, 136, 0.3)',
                color: '#5eead4',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(94, 234, 212, 0.3)',
                letterSpacing: '0.08em',
              }}>
                WAITING HALL DISPLAY
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              SmartCare Medical Centre, Kovilpatti • Outpatient Department
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#38bdf8',
          }}>
            <Clock size={18} />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? 'rgba(13, 148, 136, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${soundEnabled ? 'rgba(94, 234, 212, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
              color: soundEnabled ? '#5eead4' : '#94a3b8',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <LanguageSelector variant="button" />
        </div>
      </header>

      {/* Main Grid: Serving Highlight & Upcoming Tokens */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1.5rem',
      }}>
        {/* Left Column: Currently Called & In Consultation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* NOW CALLED BANNER */}
          <div style={{
            flex: 1,
            background: calledEntry 
              ? 'linear-gradient(145deg, rgba(2, 132, 199, 0.25) 0%, rgba(0, 97, 148, 0.18) 100%)'
              : 'rgba(255, 255, 255, 0.04)',
            border: `2px solid ${calledEntry ? '#0284c7' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '20px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: calledEntry ? '0 0 40px rgba(2, 132, 199, 0.35)' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {chimePlaying && (
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ef4444',
                color: '#fff',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                animation: 'pulse 1s infinite',
              }}>
                🔔 {getLocalized('CALL BELL ACTIVE', 'அழைப்பு ஒலிக்கிறது', 'कॉल घंटी सक्रिय')}
              </div>
            )}

            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#38bdf8',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Sparkles size={18} />
              <span>{getLocalized('NOW CALLED', 'தற்போது அழைக்கப்படும் டோக்கன்', 'वर्तमान में बुलाया गया टोकन')}</span>
            </div>

            {calledEntry ? (
              <>
                <div style={{
                  fontSize: '6rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  fontVariantNumeric: 'tabular-nums',
                  color: '#ffffff',
                  textShadow: '0 4px 30px rgba(2, 132, 199, 0.8)',
                  lineHeight: 1,
                  marginBottom: '1.25rem',
                  letterSpacing: '0.02em',
                }}>
                  {calledEntry.tokenNumber}
                </div>

                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  padding: '0.5rem 1.75rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  marginBottom: '1rem',
                }}>
                  {calledEntry.roomNumber}
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {calledEntry.doctorName} • {calledEntry.department}
                </div>

                <div style={{
                  marginTop: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '20px',
                }}>
                  {language === 'ta' 
                    ? 'தயவுசெய்து பரிசோதனை அறைக்கு செல்லவும்' 
                    : 'Please proceed directly to the consultation room'}
                </div>
              </>
            ) : currentlyServing ? (
              <>
                <div style={{
                  fontSize: '5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  lineHeight: 1,
                  marginBottom: '1rem',
                }}>
                  {currentlyServing.tokenNumber}
                </div>

                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.4rem 1.5rem',
                  borderRadius: '10px',
                  marginBottom: '0.75rem',
                }}>
                  {currentlyServing.roomNumber} — {getLocalized('In Consultation', 'ஆலோசனையில்', 'परामर्श जारी')}
                </div>

                <div style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                  {currentlyServing.doctorName}
                </div>
              </>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                {getLocalized('Next token will be called shortly', 'அடுத்த நோயாளி விரைவில் அழைக்கப்படுவார்', 'अगला टोकन शीघ्र बुलाया जाएगा')}
              </div>
            )}
          </div>

          {/* Privacy Notice Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#94a3b8',
            fontSize: '0.8rem',
          }}>
            <Shield size={16} color="var(--primary)" />
            <span>
              {getLocalized(
                'Privacy & Healthcare Compliance: Patient names and clinical details are strictly hidden on public waiting displays.',
                'பாதுகாப்பு & ரகசியத்தன்மை: பொது திரையில் நோயாளியின் பெயர்கள் அல்லது மருத்துவ விவரங்கள் காட்டப்படாது.',
                'गोपनीयता व अनुपालन: सार्वजनिक प्रतीक्षा स्क्रीन पर मरीजों के नाम या नैदानिक विवरण पूर्णतः छिपाए जाते हैं।'
              )}
            </span>
          </div>
        </div>

        {/* Right Column: Active Doctors & Upcoming Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Doctor Stations */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem',
          }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#38bdf8',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <Stethoscope size={16} />
              <span>{getLocalized('DOCTOR STATUS & STATIONS', 'மருத்துவர் இருப்பு நிலை', 'डॉक्टर स्थिति व कक्ष')}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {doctors.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {doc.specialty} • {doc.roomNumber}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    background: doc.availability === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: doc.availability === 'AVAILABLE' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${doc.availability === 'AVAILABLE' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                  }}>
                    {doc.availability === 'AVAILABLE' ? 'AVAILABLE' : `${doc.availability} (+${doc.delayMinutes}m)`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UPCOMING WAITING TOKENS */}
          <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#a78bfa',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>{getLocalized('UPCOMING TOKENS IN QUEUE', 'அடுத்த டோக்கன்கள்', 'कतार में आगामी टोकन')}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                {waitingEntries.length} {getLocalized('waiting', 'காத்திருப்பவர்கள்', 'प्रतीक्षारत')}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              flex: 1,
            }}>
              {waitingEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: entry.priorityLevel === 'EMERGENCY'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${entry.priorityLevel === 'EMERGENCY' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: entry.priorityLevel === 'EMERGENCY' ? '#f87171' : '#ffffff',
                    }}>
                      {entry.tokenNumber}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {entry.roomNumber}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: entry.priorityLevel === 'EMERGENCY' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                    }}>
                      {entry.priorityLevel === 'EMERGENCY' ? 'URGENT' : `#${idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      ~{entry.estimatedWaitMinutes}m wait
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
