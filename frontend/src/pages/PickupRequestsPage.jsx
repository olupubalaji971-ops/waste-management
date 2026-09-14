import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Truck,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Phone,
  Navigation,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const PickupRequestsPage = () => {
  const { user, hospital } = useAuth();
  const { showToast } = useNotification();
  const [pickups, setPickups] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [priority, setPriority] = useState('Normal');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (09:00 - 12:00)');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Dispatch modal
  const [selectedPickupToAssign, setSelectedPickupToAssign] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const fetchPickupsData = async () => {
    try {
      setLoading(true);
      const [pickupRes, batchesRes, vehicleRes] = await Promise.all([
        api.get('/pickups'),
        api.get('/waste?status=GENERATED'),
        api.get('/vehicles'),
      ]);

      if (pickupRes.data.success) setPickups(pickupRes.data.data);
      if (batchesRes.data.success) setAvailableBatches(batchesRes.data.data);
      if (vehicleRes.data.success) setVehicles(vehicleRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickupsData();
  }, [user]);

  const toggleBatchSelection = (batchId) => {
    if (selectedBatches.includes(batchId)) {
      setSelectedBatches(prev => prev.filter(id => id !== batchId));
    } else {
      setSelectedBatches(prev => [...prev, batchId]);
    }
  };

  const calculateSelectedWeight = () => {
    return availableBatches
      .filter(b => selectedBatches.includes(b.batchId))
      .reduce((acc, b) => acc + (b.quantity || 0), 0);
  };

  const handleCreatePickup = async (e) => {
    e.preventDefault();
    const totalWeight = calculateSelectedWeight();
    if (totalWeight <= 0 && selectedBatches.length === 0) {
      showToast('Please select at least one generated waste batch for pickup', 'warning');
      return;
    }

    try {
      const payload = {
        hospitalId: hospital?.hospitalId || 'HOSP-TG-001',
        wasteBatchIds: selectedBatches,
        wasteCategory: 'Mixed Bio-Medical Waste Stream',
        wasteQuantity: totalWeight,
        pickupAddress: hospital?.address || 'Hospital Gate 2 Disposal Area, Telangana',
        priority,
        preferredDate,
        preferredTimeSlot,
        specialInstructions,
      };

      const res = await api.post('/pickups', payload);
      if (res.data.success) {
        showToast('Pickup request created successfully!', 'success', 'Request Queued');
        setIsCreateModalOpen(false);
        setSelectedBatches([]);
        fetchPickupsData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating pickup request', 'error');
    }
  };

  const handleAssignDispatch = async (e) => {
    e.preventDefault();
    if (!selectedPickupToAssign || !selectedVehicleId) return;

    try {
      const res = await api.post(`/pickups/${selectedPickupToAssign.pickupId}/assign`, {
        vehicleId: selectedVehicleId,
      });
      if (res.data.success) {
        showToast(`Vehicle assigned to ${selectedPickupToAssign.pickupId}`, 'success');
        setSelectedPickupToAssign(null);
        setSelectedVehicleId('');
        fetchPickupsData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error assigning fleet', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Collection Pickup Requests
          </h2>
          <p className="text-xs text-slate-500">
            Schedule bio-carrier pickups, dispatch fleet vehicles, and monitor transit status
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#519755] hover:bg-[#3C733F] text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md shadow-[#519755]/20 transition-all flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Request New Waste Pickup</span>
        </button>
      </div>

      {/* Pickups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pickups.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-sm">
            No collection pickup requests registered.
          </div>
        ) : (
          pickups.map((p) => (
            <div
              key={p.pickupId}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{p.pickupId}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        p.priority === 'Emergency'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : p.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.priority}
                    </span>
                  </div>

                  <span className="bg-[#A8DCAB]/40 text-[#2B542D] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#519755]/30">
                    {p.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-[#519755]" />
                    <span className="truncate">{p.hospital?.name || p.hospitalId}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate">{p.pickupAddress}</p>
                  <p className="text-slate-600 text-[11px] flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Slot: {p.preferredDate} ({p.preferredTimeSlot})</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Weight</span>
                    <span className="font-extrabold text-slate-900">{p.wasteQuantity} kg</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Vehicle</span>
                    <span className="font-extrabold text-slate-900 truncate block">
                      {p.assignedVehicleNumber || 'Pending'}
                    </span>
                  </div>
                </div>

                {p.assignedDriverName && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                    <span className="text-amber-900 font-semibold">Driver: {p.assignedDriverName}</span>
                    <a href={`tel:${p.assignedDriverPhone}`} className="text-amber-800 font-bold hover:underline">
                      {p.assignedDriverPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {user?.role === 'super_admin' && p.status === 'Pending' && (
                  <button
                    onClick={() => setSelectedPickupToAssign(p)}
                    className="w-full bg-[#519755] hover:bg-[#3C733F] text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    Assign Vehicle & Driver
                  </button>
                )}
                {p.status !== 'Pending' && (
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Timeline: {p.timeline?.length || 1} updates</span>
                    <span className="text-[#519755] font-bold">Tracked via GPS</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Pickup Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#519755]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Request Biomedical Waste Collection
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
              
              {/* Batch Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Generated Batches for Pickup *
                </label>
                {availableBatches.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    No uncollected waste batches currently waiting. (You can still request a general pickup).
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {availableBatches.map((b) => {
                      const isChecked = selectedBatches.includes(b.batchId);
                      return (
                        <div
                          key={b.batchId}
                          onClick={() => toggleBatchSelection(b.batchId)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isChecked
                              ? 'bg-emerald-50 border-[#519755] text-slate-900'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-[#519755] focus:ring-0"
                            />
                            <span className="font-bold">{b.batchId}</span>
                            <span className="text-slate-400">({b.category})</span>
                            <span className="text-slate-600 truncate max-w-[150px]">{b.wasteType}</span>
                          </div>
                          <span className="font-extrabold text-slate-900">{b.quantity} kg</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-2 text-right text-xs font-bold text-slate-700">
                  Total Selected: <span className="text-[#519755] text-sm">{calculateSelectedWeight()} kg</span>
                </div>
              </div>

              {/* Priority Selector */}
              <div className="grid grid-cols-3 gap-3">
                {['Normal', 'High', 'Emergency'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      priority === p
                        ? p === 'Emergency'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                          : 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p} Priority
                  </button>
                ))}
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot
                  </label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                    <option value="Afternoon (13:00 - 16:00)">Afternoon (13:00 - 16:00)</option>
                    <option value="Evening (17:00 - 20:00)">Evening (17:00 - 20:00)</option>
                    <option value="Emergency Immediate Dispatch">Emergency Immediate Dispatch</option>
                  </select>
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Special Handling Instructions
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Oncology ward cytotoxic waste, Gate 3 rear access"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#519755] hover:bg-[#3C733F] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#519755]/20"
                >
                  Submit Pickup Request
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal for Admin */}
      {selectedPickupToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Assign Vehicle to {selectedPickupToAssign.pickupId}
            </h3>
            <form onSubmit={handleAssignDispatch} className="space-y-3">
              <select
                required
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs"
              >
                <option value="">-- Select Available Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} ({v.vehicleType}) - Driver: {v.driverName}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPickupToAssign(null)}
                  className="px-3 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#519755] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PickupRequestsPage;
