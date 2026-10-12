import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    ta: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Brand
  appName: { en: 'SmartCare', ta: 'ஸ்மார்ட்கேர்', hi: 'स्मार्टकेयर' },
  tagline: { 
    en: 'Secure patient flow. Clearer care.', 
    ta: 'பாதுகாப்பான நோயாளி வரிசை. தெளிவான மருத்துவம்.', 
    hi: 'सुरक्षित मरीज कतार। स्पष्ट व उत्कृष्ट देखभाल।' 
  },
  
  // Navigation
  navPatientPortal: { en: 'Patient Portal', ta: 'நோயாளி போர்டல்', hi: 'मरीज पोर्टल' },
  navDoctorStation: { en: 'Doctor Station', ta: 'மருத்துவர் தளம்', hi: 'डॉक्टर स्टेशन' },
  navReceptionDesk: { en: 'Reception Desk', ta: 'வரவேற்பு மேஜை', hi: 'रिसेप्शन डेस्क' },
  navTriageDesk: { en: 'Triage & Urgency', ta: 'அவசர சிகிச்சை பிரிவு', hi: 'आपातकालीन ट्राइएज डेस्क' },
  navAdminCenter: { en: 'Admin & Analytics', ta: 'நிர்வாகம் & பகுப்பாய்வு', hi: 'व्यवस्थापक और विश्लेषण' },
  navPharmacy: { en: 'Pharmacy Dispense', ta: 'மருந்தகம்', hi: 'फार्मेसी वितरण' },
  navPublicDisplay: { en: 'Waiting Hall Display', ta: 'பொது காத்திருப்பு திரை', hi: 'प्रतीक्षा कक्ष डिस्प्ले' },
  navAuditLogs: { en: 'Security & Audit Logs', ta: 'பாதுகாப்பு & தணிக்கை பதிவு', hi: 'सुरक्षा और ऑडिट लॉग' },
  
  // Roles
  rolePatient: { en: 'Patient', ta: 'நோயாளி', hi: 'मरीज' },
  roleDoctor: { en: 'Doctor', ta: 'மருத்துவர்', hi: 'डॉक्टर' },
  roleReceptionist: { en: 'Receptionist', ta: 'வரவேற்பாளர்', hi: 'रिसेप्शनिस्ट' },
  roleTriage: { en: 'Triage Nurse', ta: 'அவசர சிகிச்சை செவிலியர்', hi: 'ट्राइएज नर्स' },
  roleAdmin: { en: 'Administrator', ta: 'நிர்வாகி', hi: 'व्यवस्थापक' },
  rolePharmacy: { en: 'Pharmacist', ta: 'மருந்தாளுநர்', hi: 'फार्मासिस्ट' },

  // Queue & Workflow
  liveQueue: { en: 'Live Outpatient Queue', ta: 'நேரலை வெளிநோயாளி வரிசை', hi: 'लाइव ओपीडी कतार' },
  tokenNumber: { en: 'Token Number', ta: 'டோக்கன் எண்', hi: 'टोकन नंबर' },
  currentServing: { en: 'Currently Serving', ta: 'தற்போது அழைக்கப்படும் டோக்கன்', hi: 'वर्तमान में सेवारत' },
  yourToken: { en: 'Your Token', ta: 'உங்கள் டோக்கன்', hi: 'आपका टोकन' },
  patientsAhead: { en: 'Patients Ahead', ta: 'உங்களுக்கு முன் உள்ளவர்கள்', hi: 'आपके आगे मरीज' },
  estimatedWait: { en: 'Estimated Wait Time', ta: 'தோராய காத்திருப்பு நேரம்', hi: 'अनुमानित प्रतीक्षा समय' },
  doctorAvailability: { en: 'Doctor Availability', ta: 'மருத்துவர் இருப்பு நிலை', hi: 'डॉक्टर की उपलब्धता' },
  callNext: { en: 'Call Next Patient', ta: 'அடுத்த நோயாளியை அழைக்கவும்', hi: 'अगले मरीज को बुलाएं' },
  startConsultation: { en: 'Start Consultation', ta: 'ஆலோசனையை தொடங்கவும்', hi: 'परामर्श शुरू करें' },
  completeConsultation: { en: 'Complete Consultation', ta: 'ஆலோசனையை முடிக்கவும்', hi: 'परामर्श पूरा करें' },
  pauseQueue: { en: 'Pause Queue', ta: 'வரிசையை இடைநிறுத்து', hi: 'कतार रोकें' },
  resumeQueue: { en: 'Resume Queue', ta: 'வரிசையை தொடர்', hi: 'कतार पुनः शुरू करें' },
  markSkipped: { en: 'Mark as Skipped', ta: 'தவறியவராக குறிக்கவும்', hi: 'अनुपस्थित चिह्नित करें' },
  requestRejoin: { en: 'Request to Rejoin', ta: 'மீண்டும் வரிசையில் சேர விண்ணப்பிக்கவும்', hi: 'कतार में पुनः जुड़ने का अनुरोध' },
  approveRejoin: { en: 'Approve Rejoin', ta: 'மீண்டும் சேர்ப்பதை ஏற்கவும்', hi: 'पुनः प्रवेश स्वीकृत करें' },
  emergencyOverride: { en: 'Emergency Priority Override', ta: 'அவசர முன்னுரிமை மாற்றம்', hi: 'आपातकालीन प्राथमिकता बदलाव' },

  // Queue Statuses
  statusBooked: { en: 'Booked', ta: 'முன்பதிவு செய்யப்பட்டது', hi: 'बुक किया गया' },
  statusCheckedIn: { en: 'Checked In', ta: 'வருகை பதிவானது', hi: 'उपस्थिति दर्ज' },
  statusWaiting: { en: 'Waiting', ta: 'காத்திருக்கிறார்', hi: 'प्रतीक्षारत' },
  statusCalled: { en: 'Called - Proceed to Room', ta: 'அழைக்கப்பட்டார் - அறைக்கு செல்லவும்', hi: 'बुलाया गया - कमरे में जाएं' },
  statusInConsultation: { en: 'In Consultation', ta: 'ஆலோசனையில் உள்ளார்', hi: 'परामर्श जारी' },
  statusCompleted: { en: 'Completed', ta: 'முடிவடைந்தது', hi: 'सम्पन्न' },
  statusSkipped: { en: 'Skipped', ta: 'தவறிவிட்டார்', hi: 'अनुपस्थित' },
  statusEmergency: { en: 'Emergency Priority', ta: 'அவசர முன்னுரிமை', hi: 'आपातकालीन प्राथमिकता' },

  // Common Actions
  bookAppointment: { en: 'Book Appointment', ta: 'முன்பதிவு செய்க', hi: 'अपॉइंटमेंट बुक करें' },
  checkIn: { en: 'Check-In', ta: 'வருகை பதிவு', hi: 'चेक-इन करें' },
  scanQr: { en: 'Scan QR Pass', ta: 'QR பாஸ் ஸ்கேன் செய்', hi: 'क्यूआर पास स्कैन करें' },
  viewPrescription: { en: 'View Secure Prescription', ta: 'பாதுகாப்பான மருந்து சீட்டு', hi: 'सुरक्षित पर्चा देखें' },
  downloadPdf: { en: 'Download PDF', ta: 'PDF பதிவிறக்கம்', hi: 'पीडीएफ डाउनलोड करें' },
  signPrescription: { en: 'Sign Prescription', ta: 'மருந்து சீட்டில் கையொப்பமிடு', hi: 'पर्चे पर हस्ताक्षर करें' },
  logout: { en: 'Logout', ta: 'வெளியேறு', hi: 'लॉगआउट' },
  login: { en: 'Login', ta: 'உள்நுழை', hi: 'लॉगिन' },
  saveDraft: { en: 'Save Draft', ta: 'வரைவாக சேமி', hi: 'ड्राफ्ट सहेजें' },
  cancel: { en: 'Cancel', ta: 'ரத்து செய்', hi: 'रद्द करें' },
  confirm: { en: 'Confirm', ta: 'உறுதி செய்', hi: 'पुष्टि करें' },

  // OTP & Phone Verification
  phone: { en: 'Mobile Number', ta: 'மொபைல் எண்', hi: 'मोबाइल नंबर' },
  enterPhone: { en: 'Enter 10-digit mobile number', ta: '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்', hi: '10 अंकों का मोबाइल नंबर दर्ज करें' },
  sendOtp: { en: 'Send OTP to Phone', ta: 'போனுக்கு OTP அனுப்புக', hi: 'फोन पर ओटीपी भेजें' },
  otpCode: { en: 'Verification Code (OTP)', ta: 'சரிபார்ப்பு குறியீடு (OTP)', hi: 'सत्यापन कोड (ओटीपी)' },
  enterOtp: { en: 'Enter 6-digit OTP', ta: '6 இலக்க OTP ஐ உள்ளிடவும்', hi: '6 अंकों का ओटीपी दर्ज करें' },
  verifyOtp: { en: 'Verify & Sign In', ta: 'சரிபார்த்து உள்நுழைக', hi: 'सत्यापित करें और लॉगिन करें' },
  otpSentSuccess: { 
    en: 'OTP sent to your phone message', 
    ta: 'உங்கள் போன் மெசேஜுக்கு OTP அனுப்பப்பட்டது', 
    hi: 'आपके फोन संदेश पर ओटीपी भेजा गया है' 
  },
  resendOtp: { en: 'Resend Code', ta: 'மீண்டும் OTP அனுப்புக', hi: 'पुनः कोड भेजें' },
  incomingPhoneMsg: { en: 'Incoming Phone Message', ta: 'உள்வரும் போன் மெசேஜ்', hi: 'इनकमिंग फोन संदेश' },
  
  // Public Display & Stations
  room: { en: 'Room', ta: 'அறை', hi: 'कमरा' },
  doctor: { en: 'Doctor', ta: 'மருத்துவர்', hi: 'डॉक्टर' },
  department: { en: 'Department', ta: 'துறை', hi: 'विभाग' },
  status: { en: 'Status', ta: 'நிலை', hi: 'स्थिति' },
  nowServing: { en: 'Now Serving', ta: 'தற்போது அழைக்கப்படும்', hi: 'वर्तमान में सेवारत' },
  upcomingTokens: { en: 'Upcoming Tokens', ta: 'அடுத்த டோக்கன்கள்', hi: 'आगामी टोकन' },
  waitingCount: { en: 'waiting', ta: 'காத்திருப்பவர்கள்', hi: 'प्रतीक्षारत' },
  callBellActive: { en: 'CALL BELL ACTIVE', ta: 'அழைப்பு மணி ஒலிக்கிறது', hi: 'कॉल घंटी सक्रिय' },

  // Bilingual / Multilingual Label
  languageToggle: { en: 'हिन्दी', ta: 'हिन्दी', hi: 'English' },
  languageNameEn: { en: 'English', ta: 'English', hi: 'English' },
  languageNameTa: { en: 'தமிழ் (Tamil)', ta: 'தமிழ்', hi: 'தமிழ்' },
  languageNameHi: { en: 'हिन्दी (Hindi)', ta: 'இந்தி', hi: 'हिन्दी' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  getLocalized: (en: string, ta?: string, hi?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('smartcare_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('smartcare_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'en') return 'ta';
      if (prev === 'ta') return 'hi';
      return 'en';
    });
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.en || key;
  };

  const getLocalized = (en: string, ta?: string, hi?: string): string => {
    if (language === 'hi' && hi) return hi;
    if (language === 'ta' && ta) return ta;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
