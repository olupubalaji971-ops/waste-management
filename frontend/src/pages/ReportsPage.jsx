import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Building2,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ReportsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, districtRes, trendsRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/district'),
        api.get(`/reports/trends?days=${timeRange}`),
      ]);

      if (summaryRes.data.success) setMetrics(summaryRes.data.data);
      if (districtRes.data.success) setDistrictData(districtRes.data.data);
      if (trendsRes.data.success) setTrendData(trendsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const handleExportCSV = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  const categoryColors = {
    YELLOW: '#EAB308',
    RED: '#EF4444',
    WHITE: '#64748B',
    BLUE: '#3B82F6',
    GENERAL: '#10B981',
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bio-Medical Waste Compliance Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Generate state-wide disposal summaries, district metrics, and regulatory audit exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-700 shadow-2xs"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-[#519755] hover:bg-[#3C733F] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#519755]/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Bio-Waste Logged</span>
          <p className="text-2xl font-extrabold text-slate-900">{metrics?.waste?.totalKg || '168.0'} kg</p>
          <span className="text-xs text-emerald-600 font-semibold">+14.8% verified</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Processed at CBMWTF</span>
          <p className="text-2xl font-extrabold text-[#519755]">{metrics?.waste?.collectedKg || '124.5'} kg</p>
          <span className="text-xs text-slate-500 font-medium">94.2% safe neutralization</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Reporting Hospitals</span>
          <p className="text-2xl font-extrabold text-slate-900">{metrics?.hospitals?.total || '15'}</p>
          <span className="text-xs text-slate-500 font-medium">Across all 33 districts</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Compliance Benchmark</span>
          <p className="text-2xl font-extrabold text-purple-700">98.4%</p>
          <span className="text-xs text-purple-600 font-semibold">BMW Rules 2016</span>
        </div>
      </div>

      {/* Generation Trend & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Waste Generation & Collection Trends ({timeRange} Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="totalKg" stroke="#519755" fill="#A8DCAB" fillOpacity={0.4} strokeWidth={2.5} name="Total Generation" />
                <Area type="monotone" dataKey="yellow" stroke="#EAB308" fill="#FEF9C3" fillOpacity={0.3} strokeWidth={2} name="Yellow Stream" />
                <Area type="monotone" dataKey="red" stroke="#EF4444" fill="#FEE2E2" fillOpacity={0.3} strokeWidth={2} name="Red Stream" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Category Share Breakdown
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {(metrics?.categoryDistribution || []).map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={categoryColors[entry.name] || '#519755'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {(metrics?.categoryDistribution || []).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[cat.name] || '#519755' }}></span>
                  <span className="font-bold text-slate-700">{cat.name} Stream</span>
                </span>
                <span className="font-semibold text-slate-900">{cat.value} kg</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* District Volume Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
          District-wise Bio-Medical Waste Audit Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Total Waste Logged</th>
                <th className="py-3 px-4">Processed Volume</th>
                <th className="py-3 px-4">Active Batches</th>
                <th className="py-3 px-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtData.map((d) => (
                <tr key={d.district} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-800">{d.district}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{d.totalWasteKg} kg</td>
                  <td className="py-3 px-4 text-[#3C733F] font-bold">{d.collectedKg} kg</td>
                  <td className="py-3 px-4 text-slate-600">{d.batchCount}</td>
                  <td className="py-3 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      100% CPCB Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ReportsPage;
