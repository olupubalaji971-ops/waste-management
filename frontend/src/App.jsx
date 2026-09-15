import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Public Components
import Navbar from './components/Navbar';

// Core Pages
import LandingPage from './pages/LandingPage';
import HospitalDirectoryPage from './pages/HospitalDirectoryPage';
import HospitalLoginPage from './pages/HospitalLoginPage';
import HospitalDashboard from './pages/HospitalDashboard';

import DriverPortalPage from './pages/DriverPortalPage';
import DriverRegisterPage from './pages/DriverRegisterPage';
import DriverLoginPage from './pages/DriverLoginPage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import DriverQRScannerPage from './pages/DriverQRScannerPage';

import FacilityLoginPage from './pages/FacilityLoginPage';
import FacilityDashboardPage from './pages/FacilityDashboardPage';

import GoogleSheetsMirrorPage from './pages/GoogleSheetsMirrorPage';

// Role-Aware Dashboard Router (Dedicated Views)
const DynamicDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'driver') {
    return <DriverDashboardPage />;
  }
  if (user?.role === 'facility') {
    return <FacilityDashboardPage />;
  }
  if (user?.role === 'hospital_admin') {
    return <HospitalDashboard />;
  }
  return <Navigate to="/hospitals" replace />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Home Landing Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <LandingPage />
            </>
          }
        />

        {/* Hospital Portal & Login */}
        <Route
          path="/hospitals"
          element={
            <>
              <Navbar />
              <HospitalDirectoryPage />
            </>
          }
        />
        <Route path="/hospital-portal" element={<Navigate to="/hospitals" replace />} />
        <Route path="/hospital/login" element={<HospitalLoginPage />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />

        {/* Driver Portal, Register, Login, Dashboard & QR Scanner */}
        <Route path="/driver-portal" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/driver/portal" element={<Navigate to="/driver/dashboard" replace />} />
        <Route
          path="/driver/portal-info"
          element={
            <>
              <Navbar />
              <DriverPortalPage />
            </>
          }
        />
        <Route path="/driver/register" element={<DriverRegisterPage />} />
        <Route path="/driver/login" element={<DriverLoginPage />} />
        <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
        <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/driver-dashboard" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/driver/scan-qr" element={<DriverQRScannerPage />} />

        {/* CBMWTF Disposal Facility Portal Directory & Dashboard */}
        <Route path="/facility-portal" element={<Navigate to="/facility/login" replace />} />
        <Route path="/facilities" element={<Navigate to="/facility/login" replace />} />
        <Route path="/facility" element={<Navigate to="/facility/login" replace />} />
        <Route path="/facility/login" element={<FacilityLoginPage />} />
        <Route path="/facility/dashboard" element={<FacilityDashboardPage />} />

        {/* Main Application Dashboard Redirects */}
        <Route path="/app/dashboard" element={<DynamicDashboard />} />
        <Route path="/app/google-sheets" element={<GoogleSheetsMirrorPage />} />
        <Route path="/app" element={<DynamicDashboard />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
