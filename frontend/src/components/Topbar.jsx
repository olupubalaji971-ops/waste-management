import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Search,
  Plus,
  Truck,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Check,
} from 'lucide-react';

const Topbar = ({ pageTitle = 'Dashboard' }) => {
  const { user, hospital } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'super_admin':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">Super Admin (State)</span>;
      case 'hospital_admin':
        return <span className="bg-[#A8DCAB]/40 text-[#3C733F] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#519755]/40">Hospital Administrator</span>;
      case 'driver':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300">Fleet Driver</span>;
      case 'authority':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-300">Pollution Control Authority</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 shadow-2xs px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        
        {/* Left: Page Title and Breadcrumb */}
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight font-sans">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            BioWaste Smart • Telangana State Bio-Medical Waste Grid
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Action Button for Hospital Admin */}
          {user?.role === 'hospital_admin' && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/app/add-waste"
                className="flex items-center gap-1.5 bg-[#519755] hover:bg-[#3C733F] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-[#519755]/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Waste Batch</span>
              </Link>
              <Link
                to="/app/request-pickup"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Truck className="w-3.5 h-3.5 text-[#A8DCAB]" />
                <span>Request Pickup</span>
              </Link>
            </div>
          )}

          {/* Role Badge */}
          <div className="hidden md:block">
            {getRoleBadge()}
          </div>

          {/* Language Option: English / తెలుగు */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Select Language / భాషను ఎంచుకోండి"
            >
              <Globe className="w-3.5 h-3.5 text-[#519755]" />
              <span className="font-semibold hidden lg:inline">
                {language === 'te' ? 'తెలుగు' : 'English'}
              </span>
              <span className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1 py-0.2 rounded font-mono font-bold uppercase">
                {language === 'te' ? 'TE' : 'EN'}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>🇬🇧 English</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('te');
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer mt-1 ${
                    language === 'te'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>🇮🇳 తెలుగు</span>
                  {language === 'te' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all shadow-xs cursor-pointer active:scale-95 group"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#519755] hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications available
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          markAsRead(n._id);
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.read
                            ? 'bg-white border-slate-100 text-slate-600'
                            : 'bg-[#F6FAF6] border-[#A8DCAB]/60 text-slate-800 font-medium'
                        } hover:border-[#519755]`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <Link
            to="/app/profile"
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#519755] to-[#A8DCAB] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400">{hospital ? hospital.name : user?.designation}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
