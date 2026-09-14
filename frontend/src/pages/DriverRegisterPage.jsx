import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Truck,
  User,
  Phone,
  Mail,
  Lock,
  Camera,
  Upload,
  ShieldCheck,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const DriverRegisterPage = () => {
  const navigate = useNavigate();
  const { registerDriver } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    aadhaarNumber: '',
    drivingLicenseNumber: '',
    vehicleNumber: 'TS-09-UB-4501',
    photoUrl: '',
    licensePhotoUrl: '',
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Live camera photo snapshot
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      showToast('Camera access not granted. You can upload an image file instead.', 'info', 'Camera Info');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const photoData = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(photoData);
      setFormData({ ...formData, photoUrl: photoData });
      stopCamera();
      showToast('Photo captured successfully!', 'success', 'Photo Verified');
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'photoUrl') {
          setCapturedPhoto(reader.result);
        }
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.aadhaarNumber || !formData.drivingLicenseNumber) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerDriver(formData);
      if (res?.success) {
        showToast(`Driver account created! Welcome ${res.driver?.name || formData.name}.`, 'success', 'Registered');
        navigate('/driver/dashboard');
      }
    } catch (err) {
      setError('Registration failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Venkatesh Rao',
      phone: '9848123456',
      email: 'venkatesh.driver@biowastesmart.in',
      password: '9848123456@123',
      confirmPassword: '9848123456@123',
      aadhaarNumber: '5421-8890-4501',
      drivingLicenseNumber: 'TS-09-2020-7788',
      vehicleNumber: 'TS-09-UB-4501',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      licensePhotoUrl: '',
    });
    setCapturedPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
    showToast('Filled sample driver registration fields', 'info', 'Demo Data');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="text-center space-y-2">
          <Link to="/driver-portal" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline mb-1">
            <span>← Back to Driver Portal</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Driver Account
          </h1>
          <p className="text-xs text-slate-500">
            Register as a certified Bio-Medical Waste Fleet Carrier Driver in Telangana
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Quick Demo Helper */}
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
            <span className="text-amber-900 font-bold">Quick SIH Demo Auto-Fill:</span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all"
            >
              Fill Sample Driver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Personal Details */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                1. Driver Personal Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Kiran Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. 9848022338"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. kiran.driver@biowastesmart.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Passwords */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                2. Password Setup (Suggested: PhoneNumber@123)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="e.g. 9848022338@123"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Sensitive Verification Documents (Masked Storage) */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  3. Sensitive Documents (Privacy Masked)
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                  Aadhaar Last 4 Only in Logs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Number *</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="aadhaarNumber"
                      required
                      placeholder="12-digit Aadhaar Number"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number *</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="drivingLicenseNumber"
                      required
                      placeholder="e.g. TS-09-2018-9921"
                      value={formData.drivingLicenseNumber}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold font-mono"
                />
              </div>
            </div>

            {/* 4. Driver Photo & Camera Capture */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                4. Driver Photo Capture
              </h2>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-4">
                  {capturedPhoto ? (
                    <img
                      src={capturedPhoto}
                      alt="Driver Snapshot"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo with Camera</span>
                    </button>

                    <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photoUrl')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {isCameraActive && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Snap Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 px-6 rounded-2xl font-black text-xs tracking-wider shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Registering Driver Account...</span>
              ) : (
                <>
                  <span>CREATE DRIVER ACCOUNT & PROCEED</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="text-center pt-2">
            <Link to="/driver/login" className="text-xs text-slate-500 hover:text-slate-800 font-semibold">
              Already registered? <strong className="text-amber-700">Login here →</strong>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DriverRegisterPage;
