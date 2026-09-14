import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { popularTelanganaHospitals } from '../data/popularHospitals';
import {
  Building2,
  KeyRound,
  Search,
  BedDouble,
  Activity,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

const HospitalDirectoryPage = () => {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const navigate = useNavigate();

  const districts = ['All', 'Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar'];

  const filteredHospitals = popularTelanganaHospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.district.toLowerCase().includes(search.toLowerCase()) ||
      h.hospitalId.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict =
      districtFilter === 'All' || h.district.toLowerCase().includes(districtFilter.toLowerCase());

    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#519755]/30 border border-[#519755]/40 text-[#A8DCAB] text-xs font-black">
            <Building2 className="w-3.5 h-3.5" />
            <span>HOSPITAL PORTAL DIRECTORY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Select Your Hospital Facility
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Choose your registered medical center from the 12 verified Telangana healthcare institutions to access individual waste batch generation, dynamic QR coding, and driver request approvals.
          </p>

          {/* Search & Filters */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hospital name, ID, or district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-[#519755] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrictFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    districtFilter === d
                      ? 'bg-[#519755] text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Showing {filteredHospitals.length} of {popularTelanganaHospitals.length} Verified Hospitals
          </span>
          <Link to="/" className="text-xs font-bold text-[#519755] hover:underline flex items-center gap-1">
            <span>← Back to Home Portal</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((h, index) => (
            <div
              key={h.hospitalId}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#519755] transition-all duration-300 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                
                {/* Top ID & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#519755] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 inline-block mb-1">
                      {h.hospitalId}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-[#519755] transition-colors">
                      {h.name}
                    </h3>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200">
                    {h.ownership}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{h.district} • {h.address}</span>
                </div>

                {/* Bed Capacity & Waste Generation Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAF8] p-3 rounded-2xl border border-slate-200/70">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                      <BedDouble className="w-3 h-3 text-slate-400" />
                      <span>Number of Beds</span>
                    </span>
                    <strong className="text-slate-900 text-sm block">
                      {h.bedCapacity || h.beds} Beds
                    </strong>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#519755]" />
                      <span>Waste Generation</span>
                    </span>
                    <strong className="text-[#3C733F] text-sm block">
                      {h.dailyWasteKg || h.estimatedWaste}
                    </strong>
                  </div>
                </div>

                {/* Categories Pill */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                    🟡 Yellow
                  </span>
                  <span className="bg-red-100 text-red-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200">
                    🔴 Red
                  </span>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                    🔵 Blue
                  </span>
                  <span className="bg-slate-100 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-300">
                    ⚪ White
                  </span>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/hospital/login?hospitalId=${h.hospitalId}`}
                  className="w-full bg-[#519755] hover:bg-[#3C733F] text-white py-3 px-4 rounded-2xl font-black text-xs tracking-wider transition-all shadow-md shadow-[#519755]/20 flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>LOGIN TO {h.name.split(' ')[0].toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default HospitalDirectoryPage;
