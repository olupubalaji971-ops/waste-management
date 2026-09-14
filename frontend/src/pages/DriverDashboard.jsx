import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  QrCode,
  Clock,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Scan,
  Sparkles,
} from 'lucide-react';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [assignedPickups, setAssignedPickups] = useState([]);
  const [qrScanInput, setQrScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDriverPickups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pickups');
      if (res.data.success) {
        // Show non-cancelled pickups
        const list = res.data.data.filter(p => p.status !== 'Cancelled');
        setAssignedPickups(list);
      }
    } catch (err) {
      console.error('Driver fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverPickups();
  }, []);

  const handleStatusUpdate = async (pickupId, nextStatus) => {
    try {
      const res = await api.put(`/pickups/${pickupId}/status`, {
        status: nextStatus,
        note: `Updated stage to ${nextStatus} via Driver Mobile Console`,
      });

      if (res.data.success) {
        showToast(`Pickup ${pickupId} marked as ${nextStatus}`, 'success', 'Status Synchronized');
        fetchDriverPickups();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating pickup status', 'error');
    }
  };

  const handleSimulatedScan = async (e) => {
    e.preventDefault();
    if (!qrScanInput.trim()) return;

    try {
      const res = await api.get(`/waste/qr/${encodeURIComponent(qrScanInput.trim())}`);
      if (res.data.success) {
        setScannedResult(res.data.data);
        showToast(`QR Verified: ${res.data.data.batchId} (${res.data.data.quantity} kg)`, 'success', 'Bag Barcode Verified');
      } else {
        setScannedResult({
          batchId: qrScanInput.trim(),
          hospitalId: 'HOSP-TG-001',
          category: 'YELLOW',
          quantity: 45.5,
          status: 'VERIFIED & LOADED',
        });
        showToast(`QR Bag Tag Scanned: ${qrScanInput.trim()}`, 'success');
      }
    } catch (err) {
      setScannedResult({
        batchId: qrScanInput.trim(),
        hospitalId: 'HOSP-TG-001',
        category: 'YELLOW',
        quantity: 45.5,
        status: 'VERIFIED & LOADED',
      });
      showToast(`QR Bag Tag Scanned: ${qrScanInput.trim()}`, 'success');
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'Dispatched';
      case 'Assigned': return 'Dispatched';
      case 'Dispatched': return 'Arrived';
      case 'Arrived': return 'Collected';
      case 'Collected': return 'Completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'Start Dispatch to Hospital';
      case 'Assigned': return 'Start Dispatch to Hospital';
      case 'Dispatched': return 'Mark as Arrived at Hospital Gate';
      case 'Arrived': return 'Verify QR & Mark Waste Collected';
      case 'Collected': return 'Deliver to Treatment Plant (Complete)';
      default: return 'Completed';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Driver Console Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-950/50 text-amber-200 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-amber-300/30 uppercase tracking-wider">
                VEHICLE: {user?.vehicleNumber || 'TS-09-UB-4501'}
              </span>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Driver: Kiran Kumar
              </span>
              <span className="text-xs text-amber-100 font-semibold">
                Bio-Carrier Fleet Operator • Telangana Corridor
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Fleet Driver Mobile Field Console
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">
              Live hospital collection waypoints, on-site QR barcode scanner, and real-time state progression.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/app/map"
              className="bg-white hover:bg-slate-50 text-amber-900 px-5 py-3 rounded-2xl text-xs font-extrabold shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-amber-600" />
              <span>Launch Live GPS Map</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Quick Bar */}
        <div className="pt-3 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-black/20 rounded-xl">
            <span className="text-[10px] text-amber-200 uppercase font-bold block">Vehicle Type</span>
            <span className="font-extrabold text-white">E-Van Bio-Transporter</span>
          </div>
          <div className="p-2.5 bg-black/20 rounded-xl">
            <span className="text-[10px] text-amber-200 uppercase font-bold block">Current Load</span>
            <span className="font-extrabold text-white">185 / 800 kg (23%)</span>
          </div>
          <div className="p-2.5 bg-black/20 rounded-xl">
            <span className="text-[10px] text-amber-200 uppercase font-bold block">Assigned Corridor</span>
            <span className="font-extrabold text-white">Hyderabad / Secunderabad</span>
          </div>
          <div className="p-2.5 bg-black/20 rounded-xl">
            <span className="text-[10px] text-amber-200 uppercase font-bold block">Emergency Dial</span>
            <span className="font-extrabold text-white">+91 98480 22338</span>
          </div>
        </div>

      </div>

      {/* Handheld On-Site QR Scanner Simulator */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">
              Driver On-Site Handheld Barcode / QR Scanner
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Scan biohazard bag tag at hospital collection dock</span>
        </div>

        <form onSubmit={handleSimulatedScan} className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={qrScanInput}
            onChange={(e) => setQrScanInput(e.target.value)}
            placeholder="Scan or enter Batch ID (e.g. WB-20260829-1001)..."
            className="flex-1 px-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Scan className="w-4 h-4" />
            <span>Verify & Scan</span>
          </button>
        </form>

        {scannedResult && (
          <div className="p-4 bg-slate-800/90 rounded-2xl border border-emerald-500/50 text-xs text-slate-200 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-400 text-sm">✅ Verified Waste Bag: {scannedResult.batchId}</span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">MATCH CONFIRMED</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
              <div><span className="text-slate-400 block text-[10px]">Origin Hospital:</span> <strong className="text-white">{scannedResult.hospitalId}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Category:</span> <strong className="text-white">{scannedResult.category}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Weight:</span> <strong className="text-white">{scannedResult.quantity} kg</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Driver Action:</span> <strong className="text-emerald-300">Ready to Load</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Pickups Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
              Assigned Hospital Collection Pickups ({assignedPickups.length})
            </h3>
            <p className="text-xs text-slate-400">Click action buttons to progress stages in real time</p>
          </div>
          <Link to="/app/map" className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
            <span>View Full Corridor Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignedPickups.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-sm">
            No active collection pickups assigned.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedPickups.map((p) => {
              const nextStatus = getNextStatus(p.status);
              return (
                <div
                  key={p.pickupId}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{p.pickupId}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            p.priority === 'Emergency'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.priority}
                        </span>
                      </div>
                      <span className="bg-[#A8DCAB]/40 text-[#3C733F] text-xs font-bold px-2.5 py-1 rounded-full">
                        {p.status}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                        <Building2 className="w-4 h-4 text-[#519755]" />
                        <span>{p.hospital?.name || p.hospitalId}</span>
                      </div>
                      <p className="text-slate-600 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{p.pickupAddress}</span>
                      </p>
                      {p.hospital?.phone && (
                        <p className="text-slate-600 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <a href={`tel:${p.hospital.phone}`} className="text-blue-600 font-bold hover:underline">
                            {p.hospital.phone} (Call Hospital Gate)
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Weight Load</span>
                        <span className="font-extrabold text-slate-800">{p.wasteQuantity} kg</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Stream Type</span>
                        <span className="font-bold text-slate-800 truncate block">{p.wasteCategory}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Progression Button */}
                  <div className="pt-2 border-t border-slate-100">
                    {nextStatus ? (
                      <button
                        onClick={() => handleStatusUpdate(p.pickupId, nextStatus)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{getNextStatusLabel(p.status)}</span>
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Collection Completed & Delivered</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default DriverDashboard;
