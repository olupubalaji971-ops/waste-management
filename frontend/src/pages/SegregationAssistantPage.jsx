import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bmwCategories, commonSearchSuggestions } from '../data/segregationRules';
import api from '../services/api';
import {
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

const SegregationAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/waste/segregate', { query: term });
      if (res.data.success) {
        setResult(res.data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'YELLOW': return { bg: 'bg-amber-500 text-white', light: 'bg-amber-50 border-amber-300' };
      case 'RED': return { bg: 'bg-red-500 text-white', light: 'bg-red-50 border-red-300' };
      case 'WHITE': return { bg: 'bg-slate-700 text-white', light: 'bg-slate-100 border-slate-300' };
      case 'BLUE': return { bg: 'bg-blue-600 text-white', light: 'bg-blue-50 border-blue-300' };
      default: return { bg: 'bg-emerald-600 text-white', light: 'bg-emerald-50 border-emerald-300' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#519755] uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Biomedical Waste Rules 2016 Intelligent Classification</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Smart Bio-Medical Waste Segregation Engine
        </h2>
        <p className="text-xs text-slate-500">
          Enter clinical consumables, expired pharmaceuticals, or contaminated items for instant BMW container match & treatment rationale.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Search Medical Item or Consumable:
        </label>
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Used syringe, Blood contaminated cotton, IV tubing, Expired chemotherapy..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-[#519755] hover:bg-[#3C733F] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Classify Item</span>
          </button>
        </div>

        {/* Suggestion tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          <span className="text-[11px] text-slate-400 font-semibold">Popular items:</span>
          {commonSearchSuggestions.map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="bg-slate-100 hover:bg-[#A8DCAB]/40 hover:text-[#2B542D] text-slate-700 text-xs font-medium px-3 py-1 rounded-lg border border-slate-200 transition-all"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className={`p-5 rounded-2xl border ${getCategoryTheme(result.category).light} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl ${getCategoryTheme(result.category).bg} flex items-center justify-center font-extrabold text-xl shadow-md`}>
                {result.category.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Recommended Bio-Medical Stream
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {result.category} STREAM
                </h3>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/add-waste')}
              className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Log Batch in This Stream</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Prescribed Container</span>
              <p className="text-slate-800 font-bold leading-relaxed">{result.container}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Approved Disposal Protocol</span>
              <p className="text-slate-800 font-bold leading-relaxed">{result.treatment}</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-slate-700 leading-relaxed space-y-1">
            <span className="text-[#2B542D] font-extrabold block">Bio-Medical Waste 2016 Regulatory Basis:</span>
            <p>{result.rationale}</p>
          </div>

        </div>
      )}

    </div>
  );
};

export default SegregationAssistantPage;
