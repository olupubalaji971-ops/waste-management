import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { bmwCategories, commonSearchSuggestions } from '../data/segregationRules';
import SegregationAssistantModal from '../components/SegregationAssistantModal';
import QRCodeModal from '../components/QRCodeModal';
import {
  PlusCircle,
  Sparkles,
  QrCode,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  FileText,
  Weight,
  ArrowRight,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
} from 'lucide-react';

const AddWastePage = () => {
  const { user, hospital } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalId: hospital?.hospitalId || 'HOSP-TG-001',
    category: 'YELLOW',
    wasteType: '',
    quantity: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState(null);
  const [isSegregationModalOpen, setIsSegregationModalOpen] = useState(false);

  const handleAssistantSuggestion = (category, query) => {
    setFormData((prev) => ({
      ...prev,
      category,
      wasteType: query,
    }));
    showToast(`Categorized as ${category} Stream based on BMW 2016 rules!`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.wasteType || !formData.quantity) {
      showToast('Please enter waste description and quantity', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/waste', formData);
      if (res.data.success) {
        showToast('Medical waste batch logged & QR code generated!', 'success');
        setCreatedBatch(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error logging waste batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log Medical Waste Batch
          </h2>
          <p className="text-xs text-slate-500">
            Generate digital QR tag & register BMW stream for collection
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSegregationModalOpen(true)}
          className="bg-[#A8DCAB]/30 hover:bg-[#A8DCAB]/50 text-[#2B542D] border border-[#519755]/40 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-2xs self-start"
        >
          <Sparkles className="w-4 h-4 text-[#519755]" />
          <span>Launch AI Segregation Assistant</span>
        </button>
      </div>

      {/* Main Entry Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Select Bio-Medical Waste Category (BMW Rules 2016) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.keys(bmwCategories).map((key) => {
                const cat = bmwCategories[key];
                const isSelected = formData.category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: key })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-[#519755]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full mb-2 shadow-xs"
                      style={{ backgroundColor: cat.colorCode }}
                    ></div>
                    <span className="font-extrabold text-xs block">{key}</span>
                    <span className="text-[10px] opacity-75 truncate block">{cat.badgeText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Waste Type Input + Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Waste Type / Clinical Description *
              </label>
              <button
                type="button"
                onClick={() => setIsSegregationModalOpen(true)}
                className="text-[11px] font-bold text-[#519755] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Not sure which category? Ask Assistant</span>
              </button>
            </div>
            
            <input
              type="text"
              required
              value={formData.wasteType}
              onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
              placeholder="e.g. Blood-Soiled Cotton Swabs, Used Syringes, Catheters..."
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            />

            {/* Quick chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold">Common items:</span>
              {commonSearchSuggestions.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormData({ ...formData, wasteType: item })}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Measured Weight *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 24.5"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Kilograms (kg)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital Facility
              </label>
              <input
                type="text"
                disabled
                value={hospital ? `${hospital.name} (${hospital.hospitalId})` : 'Gandhi Hospital'}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
              />
            </div>
          </div>

          {/* Date, Time, Ward Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ward / Department / Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. ICU Ward 3, General OT"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/app/waste-history')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel & Return
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#519755] hover:bg-[#3C733F] text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-md shadow-[#519755]/25 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Batch & QR...</span>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Generate Batch & QR Label</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* QR Code Modal after successful creation */}
      {createdBatch && (
        <QRCodeModal
          isOpen={true}
          onClose={() => {
            setCreatedBatch(null);
            navigate('/app/waste-history');
          }}
          batch={createdBatch}
        />
      )}

      {/* Segregation Assistant Modal */}
      <SegregationAssistantModal
        isOpen={isSegregationModalOpen}
        onClose={() => setIsSegregationModalOpen(false)}
        onSelectCategory={handleAssistantSuggestion}
      />

    </div>
  );
};

export default AddWastePage;
