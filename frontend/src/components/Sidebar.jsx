import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Truck,
  QrCode,
  MapPin,
  Building2,
  FileSpreadsheet,
  Bell,
  UserCheck,
  Shield,
  Activity,
  Sparkles,
  LogOut,
  ChevronRight,
  Scan,
  KeyRound,
} from 'lucide-react';

const Sidebar = () => {
  const { user, hospital, switchDemoRole, logout } = useAuth();
  const navigate = useNavigate();

  const isDriver = user?.role === 'driver';

  const hospitalNavItems = [
    { label: 'Hospital Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Add Medical Waste', path: '/app/add-waste', icon: PlusCircle },
    { label: 'Waste Inventory & History', path: '/app/waste-history', icon: History },
    { label: 'Request Waste Pickup', path: '/app/request-pickup', icon: Truck },
    { label: 'QR Code Hub & Print', path: '/app/qr-codes', icon: QrCode },
    { label: 'Smart Segregation AI', path: '/app/segregation', icon: Sparkles },
    { label: 'Google Sheets Mirror', path: '/app/google-sheets', icon: FileSpreadsheet },
    { label: 'Live Fleet GPS Map', path: '/app/map', icon: MapPin },
    { label: 'Waste Lifecycle Audit', path: '/app/lifecycle', icon: Activity },
    { label: 'Hospitals Directory', path: '/app/hospitals', icon: Building2 },
    { label: 'Notifications', path: '/app/notifications', icon: Bell },
    { label: 'Hospital Facility Profile', path: '/app/profile', icon: UserCheck },
  ];

  const driverNavItems = [
    { label: 'Driver Console & Bookings', path: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'Scan Hospital QR', path: '/driver/scan-qr', icon: Scan },
    { label: 'Google Sheets Mirror', path: '/app/google-sheets', icon: FileSpreadsheet },
    { label: 'Assigned Pickups', path: '/app/pickups', icon: Truck },
    { label: 'Live GPS Route Map', path: '/app/map', icon: MapPin },
    { label: 'Notifications', path: '/app/notifications', icon: Bell },
  ];

  const navItems = isDriver ? driverNavItems : hospitalNavItems;

  const handleTogglePortal = async () => {
    if (isDriver) {
      await switchDemoRole('hospital_admin');
    } else {
      await switchDemoRole('driver');
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full sticky top-0 border-r border-slate-800 shadow-xl z-20 shrink-0">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] flex items-center justify-center text-white shadow-md shadow-[#519755]/30">
          {isDriver ? <Truck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="font-extrabold text-lg text-white tracking-tight leading-none">
            BioWaste<span className="text-[#A8DCAB]">Smart</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
            {isDriver ? '🚛 DRIVER FIELD PORTAL' : '🏥 HOSPITAL PORTAL'}
          </span>
        </div>
      </div>

      {/* Hospital / Driver Context Pill */}
      <div className="mx-4 mt-4 p-3 bg-slate-800/90 rounded-xl border border-slate-700/60">
        {isDriver ? (
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Truck className="w-4 h-4 shrink-0" />
              <span>TS-09-UB-4501</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Driver: Kiran Kumar</span>
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-500/40">
                ACTIVE
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-wildflower-mint font-bold text-xs">
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate text-white">{hospital?.name || 'Gandhi Hospital'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{hospital?.district || 'Hyderabad'}</span>
              <span className="bg-[#519755]/20 text-[#A8DCAB] px-1.5 py-0.5 rounded text-[10px] font-semibold border border-[#519755]/40">
                {hospital?.hospitalId || 'HOSP-TG-001'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? isDriver ? 'bg-amber-600 text-white shadow-md' : 'bg-[#519755] text-white shadow-md shadow-[#519755]/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </NavLink>
          );
        })}
      </nav>

      {/* Switch Portal Quick Button */}
      <div className="p-3 mx-3 mb-2 bg-slate-800/50 rounded-2xl border border-slate-700/50">
        <button
          onClick={handleTogglePortal}
          className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            isDriver
              ? 'bg-[#519755] hover:bg-[#3C733F] text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {isDriver ? <Building2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
          <span>Switch to {isDriver ? 'Hospital Portal' : 'Driver Portal'}</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${isDriver ? 'bg-amber-600' : 'bg-[#519755]'}`}>
            {isDriver ? 'K' : (hospital?.name?.charAt(0) || 'G')}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{isDriver ? 'Kiran Kumar' : (hospital?.name || 'Gandhi Hospital')}</p>
            <p className="text-[10px] text-slate-400 truncate">{isDriver ? 'Fleet Driver' : 'Medical Superintendent'}</p>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
