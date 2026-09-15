import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  UserPlus,
  LogIn,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const DriverPortalPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Navigation & Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline mb-2">
            <span>← Back to Home Portal</span>
          </Link>

          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/25">
            <Truck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
              Bio-Waste Collection Fleet
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              DRIVER PORTAL
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Drivers can register, login, view hospitals, request waste collection jobs, and scan authorized hospital waste QR codes.
            </p>
            <div className="pt-2">
              <Link
                to="/driver/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-amber-600/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Truck className="w-4 h-4" />
                <span>ENTER LIVE DRIVER DASHBOARD & ACTIVE JOBS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2 Main Driver Options (Register vs Login) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Option 1: Create Driver Account */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200/80 hover:border-amber-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  CREATE DRIVER ACCOUNT
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  New driver registration with Aadhaar & Driving License verification. Sensitive numbers are securely masked for your privacy.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Aadhaar & License Masked Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Driver Photo & Document Upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Instant Driver ID Generation</span>
                </div>
              </div>
            </div>

            <Link
              to="/driver/register"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 px-4 rounded-2xl font-black text-xs tracking-wider shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>REGISTER AS NEW DRIVER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Option 2: Driver Login */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200/80 hover:border-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <LogIn className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-slate-900 group-hover:text-slate-900 transition-colors">
                  DRIVER LOGIN
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sign in with your registered phone number and password to browse hospital waste batches, book pickups, and scan QR codes.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Pre-Seeded Demo Drivers Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Real-Time Job Acceptance & Camera Scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Digital Custody & Transfer Receipts</span>
                </div>
              </div>
            </div>

            <Link
              to="/driver/login"
              className="w-full bg-slate-900 hover:bg-black text-white py-3.5 px-4 rounded-2xl font-black text-xs tracking-wider shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>SIGN IN TO DRIVER CONSOLE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Security & Privacy Notice */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <strong className="block font-bold">Privacy & Cryptographic Security Guarantee:</strong>
            <p className="text-emerald-900">
              In accordance with security requirements, sensitive documents such as full Aadhaar numbers and raw license records are never stored in plaintext or exported to external spreadsheets. Passwords are strictly hashed with bcrypt.
            </p>
          </div>
        </div>

      </div>

      <div className="text-center pt-8">
        <p className="text-xs text-slate-400">
          Smart India Hackathon 2026 • BioWaste Smart Driver Fleet System
        </p>
      </div>

    </div>
  );
};

export default DriverPortalPage;
