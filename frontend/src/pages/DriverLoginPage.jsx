import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Truck,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  User,
} from 'lucide-react';

const DriverLoginPage = () => {
  const [phone, setPhone] = useState('9848123456');
  const [password, setPassword] = useState('9848123456@123');
  const [driverName, setDriverName] = useState('Venkatesh Rao');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginDriver } = useAuth();
  const { showToast } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginDriver(phone, password, driverName);
      if (res?.success) {
        showToast(`Welcome back, Driver ${res.driver?.name || driverName}!`, 'success', 'Driver Console Ready');
        navigate('/driver/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDemo = (num, pass, name) => {
    setPhone(num);
    setPassword(pass);
    setDriverName(name);
    showToast(`Filled credentials for ${name}`, 'info', 'Demo Driver');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        
        <Link to="/driver-portal" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline mb-2">
          <span>← Back to Driver Portal</span>
        </Link>

        {/* Header Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/25">
          <Truck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block mb-1">
            Bio-Waste Fleet Logistics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Driver Console Login
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authenticate to browse hospital waste batches, book collection jobs & scan QR codes
          </p>
        </div>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200 space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Driver Registered Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-mono font-bold bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. 9848123456"
                  required
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-medium bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                  placeholder="••••••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-black text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'LOGIN TO DRIVER CONSOLE'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant 1-Click Demo Drivers */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block text-center">
              1-Click Demo Driver Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAutoFillDemo('9848123456', '9848123456@123', 'Venkatesh Rao')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-left transition-all"
              >
                <strong className="block text-xs font-bold">Venkatesh Rao</strong>
                <span className="text-[10px] text-amber-700 font-mono">9848123456</span>
              </button>

              <button
                type="button"
                onClick={() => handleAutoFillDemo('9876543210', '9876543210@123', 'Ravi Kumar')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-left transition-all"
              >
                <strong className="block text-xs font-bold">Ravi Kumar</strong>
                <span className="text-[10px] text-slate-600 font-mono">9876543210</span>
              </button>
            </div>
          </div>

          {/* Prominent Create Account CTA */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <Link
              to="/driver/register"
              className="w-full bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 hover:text-amber-900 border border-slate-200 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-amber-600" />
              <span>NEW DRIVER? CREATE ACCOUNT</span>
            </Link>

            <div className="text-center">
              <Link to="/driver/dashboard" className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline">
                Skip to Live Demo Driver Console Directly →
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DriverLoginPage;
