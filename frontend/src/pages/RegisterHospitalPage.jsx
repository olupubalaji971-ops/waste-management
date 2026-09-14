import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { telanganaDistricts, hospitalTypesList } from '../data/telanganaDistricts';
import {
  Building2,
  Leaf,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  User,
  Hash,
  BedDouble,
  ArrowRight,
} from 'lucide-react';

const RegisterHospitalPage = () => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalType: 'Government Hospital',
    ownership: 'Government',
    registrationNumber: '',
    contactPerson: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    latitude: 17.3850,
    longitude: 78.4867,
    bedCapacity: 250,
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleDistrictChange = (districtName) => {
    const found = telanganaDistricts.find((d) => d.name === districtName);
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      latitude: found ? found.lat : prev.latitude,
      longitude: found ? found.lng : prev.longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setLoading(true);
    const res = await register({
      ...formData,
      name: formData.name || formData.contactPerson || formData.hospitalName,
    });
    setLoading(false);

    if (res.success) {
      showToast('Hospital registered successfully!', 'success', 'Welcome to BioWaste Smart');
      navigate('/app/dashboard');
    } else {
      showToast(res.message, 'error', 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] flex items-center justify-center text-white shadow-md shadow-[#519755]/25">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              BioWaste<span className="text-[#519755]">Smart</span>
            </span>
          </Link>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Telangana Hospital Onboarding Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-lg mx-auto">
            Connect your healthcare facility to the state-wide digital biomedical waste segregation and collection grid.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Facility Information */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                <Building2 className="w-4 h-4 text-[#519755]" />
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                  1. Healthcare Facility Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hospital / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    placeholder="e.g. Gandhi Hospital / Medicover Hospital"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hospital Type *
                  </label>
                  <select
                    value={formData.hospitalType}
                    onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  >
                    {hospitalTypesList.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ownership Category *
                  </label>
                  <select
                    value={formData.ownership}
                    onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  >
                    <option value="Government">Government / Public</option>
                    <option value="Private">Private / Trust</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Registration / License Number
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="TG-MED-12345"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bed Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.bedCapacity}
                    onChange={(e) => setFormData({ ...formData, bedCapacity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

              </div>
            </div>

            {/* Section 2: Contact & Administrator Account */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                <User className="w-4 h-4 text-[#519755]" />
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                  2. Administrator Account & Contact Info
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Person / Superintendent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value, name: e.target.value })}
                    placeholder="Dr. M. Raja Rao"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98480 12345"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Email Address (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hospital@telangana.gov.in"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

              </div>
            </div>

            {/* Section 3: Location & Coordinates */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                <MapPin className="w-4 h-4 text-[#519755]" />
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                  3. Location & GPS Telemetry Data
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Physical Address (Disposal Gate / Compound) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Musheerabad, Padmarao Nagar, Secunderabad"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Telangana District *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  >
                    {telanganaDistricts.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.state}
                    className="w-full px-4 py-2.5 bg-slate-100 rounded-xl border border-slate-300 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                  />
                </div>

              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">
                Already registered? Sign In
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#519755] hover:bg-[#3C733F] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#519755]/25 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering Facility...</span>
                ) : (
                  <>
                    <span>Submit & Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default RegisterHospitalPage;
