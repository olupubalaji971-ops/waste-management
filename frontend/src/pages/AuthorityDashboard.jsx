import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Award,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  TrendingUp,
  Download,
  AlertTriangle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AuthorityDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryRes, districtRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/district'),
        ]);
        if (summaryRes.data.success) setMetrics(summaryRes.data.data);
        if (districtRes.data.success) setDistrictData(districtRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDownloadReport = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  const treatmentData = [
    { name: 'High-Temp Incineration (Yellow)', value: 45, color: '#EAB308' },
    { name: 'Autoclaving & Recycling (Red)', value: 30, color: '#EF4444' },
    { name: 'Sharps Encapsulation (White)', value: 12, color: '#64748B' },
    { name: 'Glass Sodium Hypo (Blue)', value: 13, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner with Wildflowers Lavender Theme */}
      <div className="bg-gradient-to-r from-slate-900 via-[#3a2c3a] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#BE91BE]/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#BE91BE] text-slate-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                REGULATORY AUDIT CONSOLE
              </span>
              <span className="text-xs text-[#BE91BE] font-semibold">
                Telangana State Pollution Control Board (TSPCB)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Biomedical Waste Compliance & Environmental Audit
            </h2>
            <p className="text-xs text-white/80 max-w-xl">
              Real-time regulatory oversight, treatment plant certification, and compliance verification across healthcare facilities.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-[#519755] hover:bg-[#3C733F] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Audit CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="State Compliance Rate"
          value="98.4%"
          subtitle="BMW Rules 2016 verified"
          icon={ShieldCheck}
          colorScheme="green"
        />
        <StatCard
          title="Monitored Facilities"
          value={metrics?.hospitals?.total || '15'}
          unit="hospitals"
          subtitle="100% geo-registered"
          icon={Building2}
          colorScheme="lavender"
        />
        <StatCard
          title="Verified Safe Destruction"
          value={metrics?.waste?.collectedKg || '77.5'}
          unit="kg"
          change="+15.4%"
          isPositive={true}
          icon={Award}
          colorScheme="mint"
        />
        <StatCard
          title="District Quota Adherence"
          value="96.8%"
          subtitle="All 33 districts active"
          icon={TrendingUp}
          colorScheme="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Generation */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            District-Wise Bio-Waste Volume (kg)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="district" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalWasteKg" fill="#BE91BE" radius={[6, 6, 0, 0]} name="Total Generated" />
                <Bar dataKey="collectedKg" fill="#519755" radius={[6, 6, 0, 0]} name="Verified Processed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Treatment Protocol Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Certified Treatment Methodologies
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={treatmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {treatmentData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {treatmentData.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
                <span className="text-slate-600 truncate">{t.name} ({t.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AuthorityDashboard;
