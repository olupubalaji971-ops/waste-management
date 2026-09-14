import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, hospital } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User & Healthcare Organization Profile
        </h2>
        <p className="text-xs text-slate-500">
          Account credentials, role permissions, and hospital registration metadata
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-[#519755]/25">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-extrabold text-slate-900">{user?.name}</h3>
              <span className="bg-[#A8DCAB]/40 text-[#2B542D] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#519755]/30 uppercase">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.designation || 'Healthcare Operator'}</p>
            <p className="text-[11px] text-[#519755] font-bold mt-1">Smart India Hackathon 2026 Grid Member</p>
          </div>
        </div>

        {/* User details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Email</span>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user?.phone || '+91 40 2750 5566'}</span>
            </div>
          </div>
        </div>

        {/* Hospital Facility Profile (if linked) */}
        {hospital && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <Building2 className="w-4 h-4 text-[#519755]" />
              <span>Associated Healthcare Facility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Facility Name</span>
                <span className="font-extrabold text-slate-900 block">{hospital.name}</span>
                <span className="text-slate-500 text-[11px]">{hospital.hospitalId}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">District & State</span>
                <span className="font-extrabold text-slate-900 block">{hospital.district}</span>
                <span className="text-slate-500 text-[11px]">{hospital.state || 'Telangana'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Bed Capacity</span>
                <span className="font-extrabold text-slate-900 block">{hospital.bedCapacity || 300} Beds</span>
                <span className="text-emerald-700 font-bold text-[11px]">100% BMW Segregated</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Address:</strong> {hospital.address} (GPS: {hospital.latitude}, {hospital.longitude})</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default ProfilePage;
