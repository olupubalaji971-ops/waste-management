import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { popularTelanganaHospitals } from '../data/popularHospitals';
import {
  Leaf,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  Award,
  Sparkles,
  Unlock,
  ExternalLink,
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoRole, switchHospital } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email/hospital ID and password', 'warning');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast(`Welcome back, ${res.user.name}!`, 'success', 'Authentication Successful');
      navigate('/app/dashboard');
    } else {
      showToast(res.message, 'error', 'Login Failed');
    }
  };

  const handleQuickDemo = async (role) => {
    const res = await switchDemoRole(role);
    if (res.success) {
      showToast(`Instant Free Access: Logged in as ${res.user.name} (${res.user.role.replace('_', ' ')})`, 'success', 'Portal Unlocked');
      navigate('/app/dashboard');
    }
  };

  const handleHospitalAccess = async (hosp) => {
    const res = await switchHospital(hosp);
    if (res?.success) {
      showToast(`Direct Free Access: Logged into ${hosp.name}`, 'success', 'Hospital Portal Loaded');
      navigate('/app/dashboard');
    }
  };

  const demoAccounts = [
    {
      role: 'super_admin',
      title: 'Super Admin Portal',
      desc: 'State-wide fleet dispatch & analytics command',
      email: 'admin@biowaste.gov.in',
      icon: ShieldCheck,
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900',
    },
    {
      role: 'hospital_admin',
      title: 'Gandhi Hospital Portal',
      desc: 'Log bio-waste batches, generate QR & pickups',
      email: 'gandhi@telangana.gov.in',
      icon: Building2,
      color: 'bg-[#A8DCAB]/20 hover:bg-[#A8DCAB]/40 border-[#519755]/40 text-[#2B542D]',
    },
    {
      role: 'driver',
      title: 'Fleet Driver Console',
      desc: 'TS-09-UB-4501 live GPS & route status updates',
      email: 'driver.kiran@biowaste.gov.in',
      icon: Truck,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900',
    },
    {
      role: 'authority',
      title: 'TSPCB Authority Portal',
      desc: 'Pollution control board audit & compliance reports',
      email: 'authority@tspcb.gov.in',
      icon: Award,
      color: 'bg-[#BE91BE]/20 hover:bg-[#BE91BE]/40 border-[#BE91BE]/50 text-slate-900',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] flex items-center justify-center text-white shadow-md shadow-[#519755]/25">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            BioWaste<span className="text-[#519755]">Smart</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In & Instant Free Portal Access
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Click any role or popular hospital below for instant unrestricted access (No password required)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80 space-y-6">
          
          {/* Free Unrestricted 1-Click Portals */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>1-Click Free Portal Access (Direct Entry):</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Zero Password Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleQuickDemo(d.role)}
                    className={`p-3 rounded-2xl border text-left transition-all ${d.color} flex flex-col justify-between hover:scale-[1.01] shadow-2xs`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-extrabold text-xs">{d.title}</span>
                      <Icon className="w-4 h-4 opacity-80" />
                    </div>
                    <span className="text-[11px] opacity-75 leading-tight">{d.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Hospitals Direct Free Access */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Or Jump Directly into Any Popular Hospital Dashboard:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {popularTelanganaHospitals.slice(0, 6).map((h) => (
                <button
                  key={h.hospitalId}
                  type="button"
                  onClick={() => handleHospitalAccess(h)}
                  className="p-2.5 bg-slate-50 hover:bg-[#F6FAF6] hover:border-[#519755] border border-slate-200 rounded-xl text-left transition-all text-xs group"
                >
                  <span className="font-extrabold text-slate-800 group-hover:text-[#519755] truncate block">
                    {h.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">{h.district} • {h.bedCapacity} Beds</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-4 text-[11px] font-bold text-slate-400 uppercase">Or standard login</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address or Hospital ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. gandhi@telangana.gov.in or HOSP-TG-001"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#519755] hover:bg-[#3C733F] text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#519755]/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have a registered healthcare facility?{' '}
            <Link to="/register" className="font-bold text-[#519755] hover:underline">
              Register New Hospital
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
