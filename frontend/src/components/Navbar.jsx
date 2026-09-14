import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sparkles, Sun, Moon, Globe, ChevronDown, Check } from 'lucide-react';
import SegregationAssistantModal from './SegregationAssistantModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const [isSegregationModalOpen, setIsSegregationModalOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo with Glowing Pulse */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#519755] via-[#458548] to-[#A8DCAB] flex items-center justify-center shadow-lg shadow-[#519755]/25 group-hover:scale-105 transition-all duration-300">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-950 dark:text-white">
                    BioWaste<span className="text-[#519755]">Smart</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                  {t('brandSubtitle', 'Autonomous Medical-Waste Network')}
                </p>
              </div>
            </Link>

            {/* Navigation Right: Language, Dark Mode & Segregation Guide */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* 1. Language Option: English / తెలుగు (Telugu) */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  id="btn-language-selector"
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Select Language / భాషను ఎంచుకోండి"
                  aria-label="Language Selector"
                >
                  <Globe className="w-3.5 h-3.5 text-[#519755]" />
                  <span className="font-semibold hidden sm:inline">
                    {language === 'te' ? 'తెలుగు' : 'English'}
                  </span>
                  <span className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                    {language === 'te' ? 'TE' : 'EN'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-2.5 py-1.5 text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                      Select Language
                    </div>
                    
                    {/* English Option */}
                    <button
                      id="opt-lang-en"
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        language === 'en'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇬🇧</span>
                        <span>English</span>
                      </div>
                      {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    {/* Telugu Option */}
                    <button
                      id="opt-lang-te"
                      type="button"
                      onClick={() => {
                        setLanguage('te');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer mt-1 ${
                        language === 'te'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇮🇳</span>
                        <span>తెలుగు (Telugu)</span>
                      </div>
                      {language === 'te' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Dark Mode / Light Mode Option */}
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all shadow-xs cursor-pointer active:scale-95 group"
                title={theme === 'dark' ? t('lightMode', 'Switch to Light Mode') : t('darkMode', 'Switch to Dark Mode')}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 group-hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* 3. Segregation Guide AI */}
              <button
                id="btn-segregation-guide"
                type="button"
                onClick={() => setIsSegregationModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-[#A8DCAB]/25 hover:from-emerald-100 hover:to-[#A8DCAB]/40 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:hover:from-emerald-900/60 dark:hover:to-emerald-800/40 text-[#244626] dark:text-emerald-300 border border-[#519755]/40 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-95 group"
                title="Open BMW 2016 Segregation Rule Engine"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#519755] group-hover:rotate-12 transition-transform" />
                <span className="hidden xs:inline">{t('segregationGuide', 'Segregation Guide')}</span>
                <span className="bg-[#519755] text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">AI</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Embedded Segregation Assistant Modal */}
      <SegregationAssistantModal
        isOpen={isSegregationModalOpen}
        onClose={() => setIsSegregationModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
