import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { popularTelanganaHospitals } from '../data/popularHospitals';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Pre-configured default instant user for Gandhi Hospital
const DEFAULT_USER = {
  _id: 'default_gandhi_user',
  name: 'Gandhi Hospital Admin',
  email: 'gandhi@biowastesmart.in',
  role: 'hospital_admin',
  hospitalId: 'HOSP-TG-001',
  phone: '+91 40 2750 5566',
  designation: 'Medical Superintendent & BMW In-Charge',
};

const DEFAULT_HOSPITAL = popularTelanganaHospitals[0]; // Gandhi Hospital

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const isLoggedOut = localStorage.getItem('biowaste_logged_out');
    if (isLoggedOut === 'true') return null;
    const saved = localStorage.getItem('biowaste_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_USER;
  });

  const [hospital, setHospital] = useState(() => {
    const isLoggedOut = localStorage.getItem('biowaste_logged_out');
    if (isLoggedOut === 'true') return null;
    const saved = localStorage.getItem('biowaste_hospital');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_HOSPITAL;
  });

  const [token, setToken] = useState(localStorage.getItem('biowaste_token') || 'demo_token_sih2026');
  const [loading, setLoading] = useState(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.removeItem('biowaste_logged_out');
      localStorage.setItem('biowaste_user', JSON.stringify(user));
    }
    if (hospital) {
      localStorage.setItem('biowaste_hospital', JSON.stringify(hospital));
    }
    if (token) {
      localStorage.setItem('biowaste_token', token);
    }
  }, [user, hospital, token]);

  const loginHospital = async (email, password, hospitalId) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/hospital/login', { email, password, hospitalId });
      if (res.data?.success) {
        localStorage.setItem('biowaste_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        if (res.data.hospital) {
          setHospital(res.data.hospital);
        }
        setLoading(false);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      console.warn('Backend login fallback:', err.message);
    }

    // Fallback hospital login
    const foundHosp = popularTelanganaHospitals.find(h => h.hospitalId === hospitalId || h.email === email) || DEFAULT_HOSPITAL;
    const fallbackUser = {
      _id: `user_${foundHosp.hospitalId}`,
      name: foundHosp.name,
      email: foundHosp.email,
      role: 'hospital_admin',
      hospitalId: foundHosp.hospitalId,
      phone: foundHosp.phone,
    };
    setUser(fallbackUser);
    setHospital(foundHosp);
    setToken(`demo_token_sih2026_${foundHosp.hospitalId}`);
    setLoading(false);
    return { success: true, user: fallbackUser };
  };

  const loginDriver = async (phone, password, customName) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/driver/login', { phone, password });
      if (res.data?.success) {
        localStorage.setItem('biowaste_token', res.data.token);
        setToken(res.data.token);
        const driverObj = { ...res.data.driver, role: 'driver' };
        setUser(driverObj);
        localStorage.setItem('biowaste_user', JSON.stringify(driverObj));
        setLoading(false);
        return { success: true, driver: driverObj };
      }
    } catch (err) {
      console.warn('Driver login notice:', err.message);
    }

    // Preserve previously registered/logged driver name if matching phone
    const savedUserStr = localStorage.getItem('biowaste_user');
    let savedName = customName;
    if (!savedName && savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.name && parsed?.role === 'driver') {
          savedName = parsed.name;
        }
      } catch (e) {}
    }

    const fallbackDriver = {
      _id: 'user_driver_' + (phone || '9876543210'),
      driverId: 'DRV-TS-0101',
      name: savedName || 'Venkatesh Rao',
      phone: phone || '9848123456',
      role: 'driver',
      vehicleNumber: 'TS-09-UB-4501',
      aadhaarLast4: '4501',
      licenseLast4: '9921',
    };
    setUser(fallbackDriver);
    localStorage.setItem('biowaste_user', JSON.stringify(fallbackDriver));
    setToken(`demo_token_sih2026_driver_${fallbackDriver.driverId}`);
    setLoading(false);
    return { success: true, driver: fallbackDriver };
  };

  const registerDriver = async (driverData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/driver/register', driverData);
      if (res.data?.success) {
        localStorage.setItem('biowaste_token', res.data.token);
        setToken(res.data.token);
        const driverObj = { ...res.data.driver, role: 'driver' };
        setUser(driverObj);
        localStorage.setItem('biowaste_user', JSON.stringify(driverObj));
        setLoading(false);
        return { success: true, driver: driverObj };
      }
    } catch (err) {
      console.warn('Driver register notice:', err.message);
    }

    const newDriver = {
      _id: `user_driver_${Date.now()}`,
      driverId: `DRV-TS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: driverData.name || 'Venkatesh Rao',
      phone: driverData.phone || '9848123456',
      email: driverData.email || 'driver@biowastesmart.in',
      role: 'driver',
      vehicleNumber: driverData.vehicleNumber || 'TS-09-UB-4501',
      aadhaarLast4: driverData.aadhaarNumber?.slice(-4) || '4501',
      licenseLast4: driverData.drivingLicenseNumber?.slice(-4) || '9921',
    };
    setUser(newDriver);
    localStorage.setItem('biowaste_user', JSON.stringify(newDriver));
    setToken(`demo_token_sih2026_driver_${newDriver.driverId}`);
    setLoading(false);
    return { success: true, driver: newDriver };
  };

  const switchHospital = async (hosp) => {
    setHospital(hosp);
    const newUserData = {
      _id: `user_${hosp.hospitalId}`,
      name: hosp.name,
      email: hosp.email,
      role: 'hospital_admin',
      hospitalId: hosp.hospitalId,
      phone: hosp.phone,
    };
    setUser(newUserData);
    setToken(`demo_token_sih2026_${hosp.hospitalId}`);
  };

  const loginFacility = async (email, password, facilityId) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/facility/login', { email, password, facilityId });
      if (res.data?.success) {
        localStorage.setItem('biowaste_token', res.data.token);
        setToken(res.data.token);
        const facilityObj = { ...res.data.user, role: 'facility' };
        setUser(facilityObj);
        localStorage.setItem('biowaste_user', JSON.stringify(facilityObj));
        localStorage.setItem('activeFacilityId', res.data.facility?.facilityId || facilityId);
        setLoading(false);
        return { success: true, user: facilityObj, facility: res.data.facility };
      }
    } catch (err) {
      console.warn('Facility login fallback:', err.message);
    }

    const fallbackFacilityUser = {
      _id: `user_facility_${facilityId || 'FAC-TG-001'}`,
      id: facilityId || 'FAC-TG-001',
      name: 'Authorized CBMWTF Facility Admin',
      email: email || 'ramky@biowastesmart.in',
      role: 'facility',
      facilityId: facilityId || 'FAC-TG-001',
    };
    setUser(fallbackFacilityUser);
    localStorage.setItem('biowaste_user', JSON.stringify(fallbackFacilityUser));
    localStorage.setItem('activeFacilityId', facilityId || 'FAC-TG-001');
    setToken(`demo_token_sih2026_facility_${facilityId || 'FAC-TG-001'}`);
    setLoading(false);
    return { success: true, user: fallbackFacilityUser };
  };

  const switchFacility = async (fac) => {
    const newFacilityUser = {
      _id: `user_facility_${fac.id || fac.facilityId}`,
      id: fac.id || fac.facilityId,
      name: fac.name || fac.facilityName,
      email: fac.email,
      role: 'facility',
      facilityId: fac.id || fac.facilityId,
      district: fac.district,
      type: fac.type || fac.facilityType,
    };
    setUser(newFacilityUser);
    localStorage.setItem('biowaste_user', JSON.stringify(newFacilityUser));
    localStorage.setItem('activeFacilityId', fac.id || fac.facilityId);
    setToken(`demo_token_sih2026_facility_${fac.id || fac.facilityId}`);
  };

  const logout = () => {
    localStorage.removeItem('biowaste_token');
    localStorage.removeItem('biowaste_user');
    localStorage.removeItem('biowaste_hospital');
    localStorage.removeItem('activeFacilityId');
    localStorage.setItem('biowaste_logged_out', 'true');
    setUser(null);
    setHospital(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hospital,
        token,
        loading,
        login: loginHospital,
        loginHospital,
        loginDriver,
        registerDriver,
        switchHospital,
        loginFacility,
        switchFacility,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
