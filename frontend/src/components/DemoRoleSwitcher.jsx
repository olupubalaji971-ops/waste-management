import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { popularTelanganaHospitals } from '../data/popularHospitals';
import {
  Building2,
  Truck,
  Sparkles,
  Unlock,
  ChevronDown,
  CheckCircle2,
  MapPin,
  BedDouble,
} from 'lucide-react';

const DemoRoleSwitcher = () => {
  const { user, hospital, switchDemoRole, switchHospital } = useAuth();
  const { showToast } = useNotification();
  const [hospitalDropdownOpen, setHospitalDropdownOpen] = useState(false);

  const isHospitalPortal = user?.role === 'hospital_admin' || !user?.role || user?.role === 'super_admin' || user?.role === 'authority';
  const isDriverPortal = user?.role === 'driver';

  const handleSwitchToHospital = async (hosp) => {
    setHospitalDropdownOpen(false);
    const target = hosp || popularTelanganaHospitals[0];
    const res = await switchHospital(target);
    if (res?.success) {
      showToast(`Hospital Portal Activated: ${target.name} (${target.district})`, 'success', 'Hospital Portal');
    }
  };

  const handleSwitchToDriver = async () => {
    setHospitalDropdownOpen(false);
    const res = await switchDemoRole('driver');
    if (res?.success) {
      showToast(`Driver Portal Activated: Kiran Kumar (Bio-Carrier TS-09-UB-4501)`, 'success', 'Driver Portal');
    }
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-200 py-2 px-3 sm:px-5 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Current Active Portal Info */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
            <Unlock className="w-3 h-3" />
            <span>FREE ACCESS</span>
          </div>
          <span className="text-slate-400 font-medium">
            Active: <strong className="text-white">{isDriverPortal ? 'Fleet Driver Console (TS-09-UB-4501)' : `${hospital ? hospital.name : 'Gandhi Hospital'} Portal`}</strong>
          </span>
        </div>

        {/* Right: Clean 2-Portal Switcher (Hospital Portal & Driver Portal) */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* 1. Hospital Portal Selector */}
          <div className="relative">
            <button
              onClick={() => setHospitalDropdownOpen(!hospitalDropdownOpen)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                isHospitalPortal
                  ? 'bg-[#519755] text-white ring-2 ring-[#A8DCAB]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#A8DCAB]" />
              <span>🏥 Hospital Portal: {hospital ? hospital.name : 'Gandhi Hospital'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Dropdown with all popular hospitals */}
            {hospitalDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 max-h-96 overflow-y-auto animate-in fade-in duration-150">
                <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#A8DCAB] border-b border-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Switch Hospital Portal (All Info Available)</span>
                  <span className="text-slate-400">{popularTelanganaHospitals.length} Hospitals</span>
                </div>
                <div className="space-y-1">
                  {popularTelanganaHospitals.map((h) => {
                    const isSelected = hospital?.hospitalId === h.hospitalId;
                    return (
                      <button
                        key={h.hospitalId}
                        onClick={() => handleSwitchToHospital(h)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 group ${
                          isSelected ? 'bg-[#519755]/25 border border-[#519755]' : 'hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className={`font-extrabold text-xs block ${isSelected ? 'text-emerald-400' : 'text-white group-hover:text-wildflower-mint'}`}>
                            {h.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {h.district} • {h.bedCapacity} Beds • {h.dailyWasteKg}
                          </span>
                        </div>
                        <span className="bg-[#519755]/20 text-[#A8DCAB] text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 border border-[#519755]/40 mt-0.5">
                          {h.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Driver Portal Button */}
          <button
            onClick={handleSwitchToDriver}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
              isDriverPortal
                ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>🚛 Driver Portal (Field Console)</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default DemoRoleSwitcher;
