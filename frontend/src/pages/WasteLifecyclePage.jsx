import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WasteLifecycleTimeline from '../components/WasteLifecycleTimeline';
import {
  Activity,
  Search,
  Building2,
  Truck,
  QrCode,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const WasteLifecyclePage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchBatchId, setSearchBatchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        const res = await api.get('/waste');
        if (res.data.success) {
          setBatches(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedBatch(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchBatchId.trim()) return;

    try {
      const res = await api.get(`/waste/${searchBatchId.trim()}`);
      if (res.data.success) {
        setSelectedBatch(res.data.data);
      }
    } catch (err) {
      // search in current list
      const found = batches.find(b => b.batchId.toLowerCase().includes(searchBatchId.toLowerCase()));
      if (found) setSelectedBatch(found);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Custody Lifecycle & Audit Tracker
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end digital traceability from hospital generation to high-temperature destruction
          </p>
        </div>

        {/* Batch Lookup Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchBatchId}
              onChange={(e) => setSearchBatchId(e.target.value)}
              placeholder="Enter Batch ID (e.g. WB-20260829-1001)..."
              className="pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-[#519755]"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
          >
            Track
          </button>
        </form>
      </div>

      {/* Selected Batch Details */}
      {selectedBatch && (
        <div className="space-y-6">
          
          {/* 8-Stage Timeline */}
          <WasteLifecycleTimeline
            currentStatus={selectedBatch.status}
          />

          {/* Detailed Batch Audit Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] flex items-center justify-center text-white font-extrabold text-base shadow-xs">
                  {selectedBatch.category?.charAt(0) || 'Y'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Audit Batch
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedBatch.batchId}</h3>
                </div>
              </div>

              <span className="bg-[#A8DCAB]/40 text-[#2B542D] text-xs font-extrabold px-3 py-1 rounded-full border border-[#519755]/30">
                Current State: {selectedBatch.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Hospital Facility</span>
                <span className="font-extrabold text-slate-900 block">{selectedBatch.hospitalId}</span>
                <span className="text-slate-500 text-[11px] truncate block">{selectedBatch.hospital?.name || 'Telangana Hospital'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Category & Weight</span>
                <span className="font-extrabold text-slate-900 block">{selectedBatch.category} Stream</span>
                <span className="text-[#3C733F] font-bold text-[11px]">{selectedBatch.quantity} {selectedBatch.unit || 'kg'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Logged Timestamp</span>
                <span className="font-extrabold text-slate-900 block">{selectedBatch.date}</span>
                <span className="text-slate-500 text-[11px]">{selectedBatch.time}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Prescribed Treatment</span>
                <span className="font-extrabold text-slate-900 block truncate">{selectedBatch.treatmentMethod || 'Autoclaving / Incineration'}</span>
                <span className="text-slate-500 text-[11px]">CBMWTF Certified</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 text-xs text-slate-700 leading-relaxed flex items-center justify-between">
              <p><strong>Clinical Notes:</strong> {selectedBatch.notes || 'Routine department bio-waste collection. Barcoded bag inspected and sealed.'}</p>
              <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                BMW 2016 COMPLIANT
              </span>
            </div>

          </div>

        </div>
      )}

      {/* Select Another Batch List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
          Select Another Batch for Chain-of-Custody Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {batches.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setSelectedBatch(b)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedBatch?.batchId === b.batchId
                  ? 'bg-[#F6FAF6] border-[#519755] shadow-sm ring-2 ring-[#A8DCAB]'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-slate-900">{b.batchId}</span>
                <span className="text-[10px] font-bold text-slate-500">{b.category}</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">{b.wasteType}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>{b.quantity} kg</span>
                <span className="font-bold text-[#3C733F]">{b.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WasteLifecyclePage;
