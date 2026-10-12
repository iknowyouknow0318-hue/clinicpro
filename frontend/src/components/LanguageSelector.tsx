import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'pill' | 'button' | 'dropdown';
  className?: string;
  style?: React.CSSProperties;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'button',
  style
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; native: string; flag: string }[] = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (variant === 'pill') {
    return (
      <div 
        style={{
          display: 'inline-flex',
          background: 'var(--bg-input, #f1f5f9)',
          border: '1px solid var(--border-color, #cbd5e1)',
          borderRadius: '20px',
          padding: '2px',
          gap: '2px',
          ...style
        }}
      >
        {languages.map((l) => {
          const isActive = l.code === language;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                background: isActive ? 'var(--primary, #0284c7)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {l.native}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.38rem 0.75rem',
          borderRadius: 'var(--radius, 8px)',
          background: 'var(--primary-bg, #f0f9ff)',
          border: '1px solid var(--primary-border, #bae6fd)',
          color: 'var(--primary-dark, #0369a1)',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Select Language / மொழியை மாற்றவும் / भाषा चुनें"
      >
        <Globe size={14} />
        <span>{currentLang.native}</span>
        <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            background: '#ffffff',
            border: '1px solid var(--border-color, #cbd5e1)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '0.35rem',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', padding: '0.3rem 0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Language / மொழி / भाषा
          </div>
          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isSelected ? 'var(--primary-bg, #f0f9ff)' : 'transparent',
                  color: isSelected ? 'var(--primary-dark, #0369a1)' : '#334155',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{l.flag}</span>
                  <div>
                    <div style={{ lineHeight: 1.1 }}>{l.native}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{l.label}</div>
                  </div>
                </div>
                {isSelected && <Check size={14} color="var(--primary, #0284c7)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
