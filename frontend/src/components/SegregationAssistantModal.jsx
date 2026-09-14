import React, { useState } from 'react';
import { commonSearchSuggestions } from '../data/segregationRules';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  ShieldCheck,
  X,
  Info,
} from 'lucide-react';

const SegregationAssistantModal = ({ isOpen, onClose, onSelectCategory }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();

  if (!isOpen) return null;

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
      // Fallback local rule match
      const lower = term.toLowerCase();
      let matchedCategory = 'YELLOW';
      let container = 'Yellow Non-Chlorinated Bag';
      let treatment = 'High-Temperature Incineration';
      let rationale = 'Infectious clinical item requiring yellow stream isolation.';

      if (lower.includes('syringe') || lower.includes('needle') || lower.includes('blade') || lower.includes('scalpel') || lower.includes('sharps')) {
        matchedCategory = 'WHITE';
        container = 'White Translucent, Puncture-Proof, Tamper-Proof Container';
        treatment = 'Autoclaving / Dry Heat Sterilization followed by Shredding / Sharp Pit Encapsulation';
        rationale = 'Sharps with needle-stick injury risk must be disposed of in puncture-proof white containers.';
      } else if (lower.includes('tube') || lower.includes('catheter') || lower.includes('glove') || lower.includes('iv') || lower.includes('plastic')) {
        matchedCategory = 'RED';
        container = 'Red Non-Chlorinated Plastic Bag';
        treatment = 'Autoclaving / Microwaving followed by Mutilation and Certified Plastic Recycling';
        rationale = 'Contaminated recyclable plastics should be isolated for safe sterilization and shredding.';
      } else if (lower.includes('glass') || lower.includes('vial') || lower.includes('ampoule') || lower.includes('bottle')) {
        matchedCategory = 'BLUE';
        container = 'Puncture-proof and Leak-proof Blue Cardboard Box / Rigid Bin';
        treatment = 'Sodium Hypochlorite Disinfection / Autoclaving followed by Glass Recycling';
        rationale = 'Glassware and ampoules are segregated separately to avoid breakage and chemical exposure.';
      } else if (lower.includes('food') || lower.includes('paper') || lower.includes('box') || lower.includes('wrapper')) {
        matchedCategory = 'GENERAL';
        container = 'Black / Green Municipal Bins';
        treatment = 'Municipal Solid Waste Recycling / Composting';
        rationale = 'Non-infectious domestic and office waste.';
      }

      setResult({
        category: matchedCategory,
        container,
        treatment,
        rationale,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'YELLOW':
        return { bg: 'bg-amber-500 text-white', lightBg: 'bg-amber-50 border-amber-300 text-amber-900', border: 'border-amber-400' };
      case 'RED':
        return { bg: 'bg-red-500 text-white', lightBg: 'bg-red-50 border-red-300 text-red-900', border: 'border-red-400' };
      case 'WHITE':
        return { bg: 'bg-slate-700 text-white', lightBg: 'bg-slate-100 border-slate-300 text-slate-800', border: 'border-slate-400' };
      case 'BLUE':
        return { bg: 'bg-blue-600 text-white', lightBg: 'bg-blue-50 border-blue-300 text-blue-900', border: 'border-blue-400' };
      case 'GENERAL':
        return { bg: 'bg-emerald-600 text-white', lightBg: 'bg-emerald-50 border-emerald-300 text-emerald-900', border: 'border-emerald-400' };
      default:
        return { bg: 'bg-slate-800 text-white', lightBg: 'bg-slate-50 border-slate-200 text-slate-900', border: 'border-slate-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] flex items-center justify-center text-white shadow-md shadow-[#519755]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                {t('segModalTitle', 'Smart Bio-Waste Segregation Assistant')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('segModalSub', 'Rule-Based Classification Engine • Bio-Medical Waste Rules 2016')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {t('segSearchPlaceholder', 'Enter Medical Item, Waste Material, or Consumable')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('segSearchPlaceholder', 'e.g. Used syringe, Blood contaminated cotton, IV tubing...')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755] focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="bg-[#519755] hover:bg-[#3C733F] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#519755]/25 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('segSearchBtn', 'Classify')}</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold">Try examples:</span>
          {commonSearchSuggestions.slice(0, 5).map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="bg-slate-100 hover:bg-[#A8DCAB]/30 hover:text-[#3C733F] text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all border border-slate-200"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Result Area */}
        <div className="mt-5 flex-1 overflow-y-auto">
          {result ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Category Banner */}
              <div className={`p-4 rounded-2xl border ${getCategoryStyles(result.category).lightBg} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${getCategoryStyles(result.category).bg} flex items-center justify-center font-extrabold text-base shadow-sm`}>
                    {result.category.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recommended Category</span>
                    <h4 className="text-xl font-extrabold tracking-tight">{result.category} STREAM</h4>
                  </div>
                </div>
                {onSelectCategory && (
                  <button
                    onClick={() => {
                      onSelectCategory(result.category, query);
                      onClose();
                    }}
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <span>Use Category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Container & Treatment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-700 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#519755]" />
                    <span>Prescribed Container</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{result.container}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-700 mb-1">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    <span>Treatment Protocol</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{result.treatment}</p>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#3C733F] mb-1">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Compliance Rationale & Scientific Basis</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{result.rationale}</p>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#A8DCAB] mb-2 opacity-80" />
              <p className="font-semibold text-slate-600">Enter any medical waste item to see instant classification</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Matches against 60+ clinical items, Bio-Medical Waste (Management) Rules 2016, and CPCB guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegregationAssistantModal;
