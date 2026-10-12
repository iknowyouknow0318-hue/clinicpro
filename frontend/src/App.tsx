import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { PatientPortal } from './pages/PatientPortal';
import { DoctorSearchBooking } from './pages/DoctorSearchBooking';
import { ReceptionDashboard } from './pages/ReceptionDashboard';
import { PatientRegistration } from './pages/PatientRegistration';
import { AppointmentCalendar } from './pages/AppointmentCalendar';
import { PatientQueueScreen } from './pages/PatientQueueScreen';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ConsultationForm } from './pages/ConsultationForm';
import { PrescriptionBuilder } from './pages/PrescriptionBuilder';
import { PharmacyDashboard } from './pages/PharmacyDashboard';
import { InventoryDashboard } from './pages/InventoryDashboard';
import { FollowUpDashboard } from './pages/FollowUpDashboard';
import { PatientStatusPage } from './pages/PatientStatusPage';
import { IntelligenceDashboard } from './pages/IntelligenceDashboard';
import { PublicDisplay } from './pages/PublicDisplay';
import { AuditLogsPage } from './pages/AuditLogsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--bg-primary)' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const SmartRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'PATIENT') {
    return <Navigate to="/patient-portal" replace />;
  }
  if (user?.role === 'DOCTOR') {
    return <Navigate to="/doctor" replace />;
  }
  if (user?.role === 'PHARMACY') {
    return <Navigate to="/pharmacy" replace />;
  }
  if (user?.role === 'ADMIN') {
    return <Navigate to="/intelligence" replace />;
  }
  return <Navigate to="/reception" replace />;
};

import { PhoneMessageBanner } from './components/PhoneMessageBanner';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <PhoneMessageBanner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login */}
            <Route path="/login" element={<Login />} />

            {/* Public TV Queue Display for Hospital Waiting Halls (No login required) */}
            <Route path="/public-display" element={<PublicDisplay />} />

            {/* Patient Experience */}
            <Route path="/patient-portal" element={<AppLayout><PatientPortal /></AppLayout>} />
            <Route path="/find-doctors" element={<AppLayout><DoctorSearchBooking /></AppLayout>} />

            {/* Clinical & Staff Experience */}
            <Route path="/reception" element={<AppLayout><ReceptionDashboard /></AppLayout>} />
            <Route path="/register-patient" element={<AppLayout><PatientRegistration /></AppLayout>} />
            <Route path="/appointments" element={<AppLayout><AppointmentCalendar /></AppLayout>} />
            <Route path="/queue" element={<AppLayout><PatientQueueScreen /></AppLayout>} />
            <Route path="/doctor" element={<AppLayout><DoctorDashboard /></AppLayout>} />
            <Route path="/consultation" element={<AppLayout><ConsultationForm /></AppLayout>} />
            <Route path="/prescriptions" element={<AppLayout><PrescriptionBuilder /></AppLayout>} />
            <Route path="/pharmacy" element={<AppLayout><PharmacyDashboard /></AppLayout>} />
            <Route path="/inventory" element={<AppLayout><InventoryDashboard /></AppLayout>} />
            <Route path="/follow-ups" element={<AppLayout><FollowUpDashboard /></AppLayout>} />
            <Route path="/patient-status" element={<AppLayout><PatientStatusPage /></AppLayout>} />
            <Route path="/intelligence" element={<AppLayout><IntelligenceDashboard /></AppLayout>} />
            <Route path="/audit-logs" element={<AppLayout><AuditLogsPage /></AppLayout>} />

            {/* Smart role-based fallback */}
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
