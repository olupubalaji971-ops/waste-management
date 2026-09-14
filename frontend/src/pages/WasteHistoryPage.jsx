import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import {
  History,
  Search,
  Filter,
  QrCode,
  Download,
  PlusCircle,
  Calendar,
  Building2,
  CheckCircle2,
  Trash2,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  X,
  Key,
} from 'lucide-react';

const WasteHistoryPage = () => {
  const { user, hospital } = useAuth();
  const { showToast } = useNotification();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchForQr, setSelectedBatchForQr] = useState(null);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      let url = `/waste?category=${categoryFilter}&status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBatches(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBatches();
  };

  const categoryBadgeColors = {
    YELLOW: 'bg-amber-500 text-white',
    RED: 'bg-red-500 text-white',
    WHITE: 'bg-slate-700 text-white',
    BLUE: 'bg-blue-600 text-white',
    GENERAL: 'bg-emerald-600 text-white',
  };

  const totalKg = batches.reduce((acc, b) => acc + (b.quantity || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Bio-Medical Waste Batch Inventory
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>CONFIDENTIALITY PROTECTED</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Secured QR code catalog, hazardous categorization, and authorized access control
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMasterUnlockSession}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
            title="Unlock all batches with administrator authorization"
          >
            <Unlock className="w-4 h-4 text-emerald-600" />
            <span>Master Unlock Session</span>
          </button>

          <Link
            to="/app/add-waste"
            className="bg-[#519755] hover:bg-[#3C733F] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#519755]/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log New Waste Batch</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Batch ID, item description, hospital..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            />
          </form>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            >
              <option value="All">All Categories</option>
              <option value="YELLOW">Yellow (Infectious/Anatomical)</option>
              <option value="RED">Red (Plastics/Catheters)</option>
              <option value="WHITE">White (Sharps/Needles)</option>
              <option value="BLUE">Blue (Glassware/Vials)</option>
              <option value="GENERAL">General (Municipal)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            >
              <option value="All">All Statuses</option>
              <option value="GENERATED">GENERATED</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="COLLECTED">COLLECTED</option>
              <option value="PROCESSED">PROCESSED</option>
            </select>
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{batches.length}</strong> waste batches
          </span>
          <span>
            Cumulative Weight:{' '}
            <strong className="text-slate-900">{Math.round(totalKg * 10) / 10} kg</strong>
          </span>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Batch ID</th>
                <th className="py-3.5 px-4">Stream</th>
                <th className="py-3.5 px-4">Waste Description</th>
                <th className="py-3.5 px-4">Weight</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Hospital / Ward</th>
                <th className="py-3.5 px-4">Lifecycle Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                    No medical waste batches found matching your filters.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.batchId} className="hover:bg-slate-50/70 transition-colors">
                    {/* 1. Batch ID */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{b.batchId}</td>

                    {/* 2. Stream Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          categoryBadgeColors[b.category] || 'bg-slate-800 text-white'
                        }`}
                      >
                        {b.category}
                      </span>
                    </td>

                    {/* 3. Waste Description */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <span className="font-semibold text-slate-800 truncate block">
                        {b.wasteType}
                      </span>
                    </td>

                    {/* 4. Weight */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {b.quantity} {b.unit || 'kg'}
                    </td>

                    {/* 5. Date & Time */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {b.date} {b.time}
                    </td>

                    {/* 6. Hospital & Ward Notes */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      <span className="font-bold text-slate-800 block">{b.hospitalId}</span>
                      <span className="text-slate-500 truncate block max-w-[140px]">
                        {b.notes || 'Ward Dept'}
                      </span>
                    </td>

                    {/* 7. Status */}
                    <td className="py-3.5 px-4">
                      <span className="bg-[#A8DCAB]/40 text-[#2B542D] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#519755]/30">
                        {b.status}
                      </span>
                    </td>

                    {/* 8. Actions (QR Label) */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBatchForQr(b)}
                        className="bg-[#519755] hover:bg-[#3C733F] text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Label</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={!!selectedBatchForQr}
        onClose={() => setSelectedBatchForQr(null)}
        batch={selectedBatchForQr}
      />
    </div>
  );
};

export default WasteHistoryPage;

