import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Building2,
  Truck,
  TrendingUp,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Clock,
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
  AreaChart,
  Area,
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [metrics, setMetrics] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [pendingPickups, setPendingPickups] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedPickupToAssign, setSelectedPickupToAssign] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [summaryRes, districtRes, trendsRes, pickupsRes, vehiclesRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/district'),
        api.get('/reports/trends?days=7'),
        api.get('/pickups?status=Pending'),
        api.get('/vehicles'),
      ]);

      if (summaryRes.data.success) setMetrics(summaryRes.data.data);
      if (districtRes.data.success) setDistrictData(districtRes.data.data.slice(0, 8));
      if (trendsRes.data.success) setTrendData(trendsRes.data.data);
      if (pickupsRes.data.success) setPendingPickups(pickupsRes.data.data);
      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
    } catch (err) {
      console.error('Admin Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignDispatch = async (e) => {
    e.preventDefault();
    if (!selectedPickupToAssign || !selectedVehicleId) {
      showToast('Please select a collection vehicle', 'warning');
      return;
    }

    try {
      const res = await api.post(`/pickups/${selectedPickupToAssign.pickupId}/assign`, {
        vehicleId: selectedVehicleId,
      });

      if (res.data.success) {
        showToast(`Vehicle assigned to ${selectedPickupToAssign.pickupId}`, 'success', 'Fleet Dispatched');
        setSelectedPickupToAssign(null);
        setSelectedVehicleId('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign vehicle', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* State Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                STATE CENTRAL GRID
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Telangana State Bio-Medical Waste Command Center
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              State Administration & Fleet Command
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Centralized monitoring for 33 districts, active collection fleet dispatch, and hazardous medical waste compliance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/app/map"
              className="bg-[#519755] hover:bg-[#3C733F] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#A8DCAB]" />
              <span>Live Fleet GPS Map</span>
            </Link>
            <Link
              to="/app/reports"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-wildflower-rose" />
              <span>Download Audit Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Hospitals"
          value={metrics?.hospitals?.total || '15'}
          unit="facilities"
          subtitle={`${metrics?.hospitals?.govt || '13'} Govt • ${metrics?.hospitals?.private || '2'} Private`}
          icon={Building2}
          colorScheme="green"
        />
        <StatCard
          title="State-wide Bio-Waste"
          value={metrics?.waste?.totalKg || '168.0'}
          unit="kg"
          change="+14.2%"
          isPositive={true}
          icon={TrendingUp}
          colorScheme="mint"
        />
        <StatCard
          title="Pending Dispatches"
          value={metrics?.pickups?.pending || '1'}
          unit="requests"
          subtitle={`${metrics?.pickups?.emergency || '1'} Emergency priority`}
          icon={AlertTriangle}
          colorScheme="rose"
        />
        <StatCard
          title="Active Collection Fleet"
          value={metrics?.fleet?.active || '2'}
          unit={`/ ${metrics?.fleet?.total || '4'} vehicles`}
          subtitle={`${metrics?.fleet?.available || '2'} Available for dispatch`}
          icon={Truck}
          colorScheme="lavender"
        />
      </div>

      {/* Charts: District Analytics & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Generation Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Bio-Waste Generated by District (kg)
              </h3>
              <p className="text-xs text-slate-400">Telangana top district clusters</p>
            </div>
            <span className="bg-[#A8DCAB]/30 text-[#3C733F] text-[11px] font-bold px-2.5 py-1 rounded-full">
              District Leaderboard
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="district" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalWasteKg" fill="#519755" radius={[6, 6, 0, 0]} name="Total Waste (kg)" />
                <Bar dataKey="collectedKg" fill="#A8DCAB" radius={[6, 6, 0, 0]} name="Collected (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Generation Trends */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                State-wide Daily Collection Trends
              </h3>
              <p className="text-xs text-slate-400">7-Day hazardous vs recyclable breakdown</p>
            </div>
            <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
              94.2% Safe Processing
            </span>
          </div>

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
                <Area type="monotone" dataKey="yellow" stroke="#EAB308" fill="#FEF9C3" fillOpacity={0.5} strokeWidth={2} name="Yellow Stream" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Pending Pickups Queue & Fleet Dispatch Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>Pending Pickup Queue & Fleet Dispatch</span>
            </h3>
            <p className="text-xs text-slate-400">Assign available bio-carriers to waiting hospital requests</p>
          </div>
          <Link
            to="/app/pickups"
            className="text-xs font-bold text-[#519755] hover:text-[#3C733F] flex items-center gap-1"
          >
            <span>View All Pickups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3">Pickup ID</th>
                <th className="pb-3">Hospital</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Address</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingPickups.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No pending pickup requests in queue.
                  </td>
                </tr>
              ) : (
                pendingPickups.map((p) => (
                  <tr key={p.pickupId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-extrabold text-slate-900">{p.pickupId}</td>
                    <td className="py-3 font-bold text-slate-800">{p.hospital?.name || p.hospitalId}</td>
                    <td className="py-3 text-slate-600">{p.wasteCategory}</td>
                    <td className="py-3 font-bold text-slate-800">{p.wasteQuantity} kg</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          p.priority === 'Emergency'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.priority}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 truncate max-w-[200px]">{p.pickupAddress}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedPickupToAssign(p)}
                        className="bg-[#519755] hover:bg-[#3C733F] text-white px-3.5 py-1.5 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                      >
                        Dispatch Fleet
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Dispatch Modal */}
      {selectedPickupToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#519755]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Dispatch Vehicle for {selectedPickupToAssign.pickupId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPickupToAssign(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><span className="font-bold text-slate-700">Hospital:</span> {selectedPickupToAssign.hospital?.name || selectedPickupToAssign.hospitalId}</p>
              <p><span className="font-bold text-slate-700">Quantity:</span> {selectedPickupToAssign.wasteQuantity} kg ({selectedPickupToAssign.wasteCategory})</p>
              <p><span className="font-bold text-slate-700">Priority:</span> <span className="font-extrabold text-rose-600">{selectedPickupToAssign.priority}</span></p>
            </div>

            <form onSubmit={handleAssignDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Bio-Carrier Vehicle *
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                >
                  <option value="">-- Choose Active Fleet Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.vehicleNumber} ({v.vehicleType}) - Driver: {v.driverName} [{v.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPickupToAssign(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#519755] hover:bg-[#3C733F] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
