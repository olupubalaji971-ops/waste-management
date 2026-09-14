import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Factory,
  QrCode,
  ShieldCheck,
  Building2,
  Truck,
  Flame,
  CheckCircle2,
  RefreshCw,
  Printer,
  Download,
  Calendar,
  Clock,
  LogOut,
  MapPin,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronDown,
  Layers,
  Radio,
  FileSpreadsheet,
  Sun,
  Moon,
  Globe,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ALL_10_FACILITIES = [
  { id: 'FAC-TG-001', name: 'Ramky Enviro CBMWTF (Dundigal Central Facility)', district: 'Medchal-Malkajgiri', email: 'ramky@biowastesmart.in' },
  { id: 'FAC-TG-002', name: 'Maridi Eco Industries CBMWTF Medchal', district: 'Medchal', email: 'maridi@biowastesmart.in' },
  { id: 'FAC-TG-003', name: 'G.J. Multiclave Bio-Medical Facility Bibinagar', district: 'Yadadri Bhuvanagiri', email: 'multiclave@biowastesmart.in' },
  { id: 'FAC-TG-004', name: 'Medicare Environmental Management Pashamylaram', district: 'Sangareddy', email: 'medicare@biowastesmart.in' },
  { id: 'FAC-TG-005', name: 'Clean Enviro Bio-Disposal Cherlapally', district: 'Medchal-Malkajgiri', email: 'cleanenviro@biowastesmart.in' },
  { id: 'FAC-TG-006', name: 'Apex Waste Solutions CBMWTF Balanagar', district: 'Hyderabad', email: 'apex@biowastesmart.in' },
  { id: 'FAC-TG-007', name: 'Telangana Eco-Care Treatment Plant Choutuppal', district: 'Yadadri Bhuvanagiri', email: 'ecocare@biowastesmart.in' },
  { id: 'FAC-TG-008', name: 'Warangal Regional Bio-Management Facility', district: 'Warangal', email: 'warangalcbmwtf@biowastesmart.in' },
  { id: 'FAC-TG-009', name: 'Karimnagar Green Waste Treatment Plant', district: 'Karimnagar', email: 'karimnagar@biowastesmart.in' },
  { id: 'FAC-TG-010', name: 'Nizamabad Bio-Disposal & Incineration Facility', district: 'Nizamabad', email: 'nizamabad@biowastesmart.in' },
];

const FacilityDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { socket, showToast } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [activeFacilityId, setActiveFacilityId] = useState(
    localStorage.getItem('activeFacilityId') || user?.facilityId || 'FAC-TG-001'
  );
  const [facilityData, setFacilityData] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [incomingVehicles, setIncomingVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalBatchesTreated: 0,
    totalWeightKg: 0,
    activeIncinerators: 2,
    activeAutoclaves: 3,
  });
  const [loading, setLoading] = useState(true);
  const [isRotatingQR, setIsRotatingQR] = useState(false);
  const [latestIntakeAlert, setLatestIntakeAlert] = useState(null);

  // Fetch facility dashboard data
  const fetchFacilityData = async (facilityId, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const targetId = facilityId || activeFacilityId;
      const res = await api.get(`/facility/dashboard?facilityId=${targetId}`);
      const data = res.data;

      if (data?.success && data.data) {
        setFacilityData(data.data.facility);
        // KEEP QR CODE COMPLETELY CONSTANT - only refresh when version or token changes after a driver scan
        if (data.data.qrPayload) {
          setQrPayload((prev) => {
            if (!prev) return data.data.qrPayload;
            if (prev.version !== data.data.qrPayload.version || prev.token !== data.data.qrPayload.token) {
              return data.data.qrPayload;
            }
            return prev;
          });
        }
        setDeposits(data.data.deposits || []);
        setIncomingVehicles(data.data.incomingVehicles || []);
        setStats(data.data.stats || stats);
      }
    } catch (err) {
      console.warn('Facility dashboard fetch notice:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilityData(activeFacilityId, true);
    // Poll deposits periodically without reloading or touching constant QR code
    const pollInterval = setInterval(() => {
      fetchFacilityData(activeFacilityId, false);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [activeFacilityId]);

  // Real-time Socket.IO subscriptions for this facility
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_facility', activeFacilityId);
    socket.emit('join_room', `facility:${activeFacilityId}`);

    const handleWasteDeposited = (intake) => {
      if (intake.disposalFacilityId && intake.disposalFacilityId !== activeFacilityId) {
        return;
      }
      setLatestIntakeAlert(intake);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      showToast(
        `✓ INTAKE VERIFIED: Driver ${intake.driverName} (${intake.vehicleNumber}) deposited ${intake.wasteQuantity} kg ${intake.wasteCategory} from ${intake.hospitalName}!`,
        'success',
        'Waste Deposited'
      );
      // Prepend to deposits log
      setDeposits((prev) => [intake, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalBatchesTreated: prev.totalBatchesTreated + 1,
        totalWeightKg: prev.totalWeightKg + (intake.wasteQuantity || 0),
      }));
    };

    const handleQRRefreshed = (newQR) => {
      if (newQR.facilityId && newQR.facilityId !== activeFacilityId) {
        return;
      }
      setQrPayload((prev) => {
        if (prev && prev.version === newQR.version && prev.token === newQR.token) {
          return prev;
        }
        showToast(`Gate QR code rotated to Version ${newQR.version} for next driver`, 'info', 'QR Rotated');
        return newQR;
      });
    };

    const handleCarrierInTransit = (carrier) => {
      showToast(
        `🚛 INCOMING CARRIER: ${carrier.vehicleNumber} carrying ${carrier.quantityKg || 42} kg (${carrier.category}) from ${carrier.hospitalName} is in transit to your yard!`,
        'info',
        'Incoming Carrier Dispatched'
      );
      setIncomingVehicles((prev) => [carrier, ...prev]);
    };

    socket.on('carrier_in_transit', handleCarrierInTransit);
    socket.on('waste_deposited', handleWasteDeposited);
    socket.on('facility_intake_received', handleWasteDeposited);
    socket.on('qr_refreshed', handleQRRefreshed);
    socket.on('facility_qr_updated', (data) => {
      if (data.facilityId === activeFacilityId && data.qrPayload) {
        setQrPayload((prev) => {
          if (prev && prev.version === data.qrPayload.version && prev.token === data.qrPayload.token) {
            return prev;
          }
          return data.qrPayload;
        });
      }
    });

    return () => {
      socket.off('carrier_in_transit', handleCarrierInTransit);
      socket.off('waste_deposited', handleWasteDeposited);
      socket.off('facility_intake_received', handleWasteDeposited);
      socket.off('qr_refreshed', handleQRRefreshed);
      socket.off('facility_qr_updated');
    };
  }, [socket, activeFacilityId]);

  // Manually regenerate / rotate Gate QR
  const handleRegenerateQR = async () => {
    setIsRotatingQR(true);
    try {
      const res = await api.post('/facility/regenerate-qr', { facilityId: activeFacilityId });
      if (res.data?.success) {
        setQrPayload(res.data.data);
        showToast(`Gate QR code rotated to Version ${res.data.data.version}`, 'success', 'QR Rotated');
      }
    } catch (err) {
      showToast('Failed to rotate QR code', 'error');
    } finally {
      setIsRotatingQR(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('facility-gate-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Facility-Gate-QR-${activeFacilityId}-v${qrPayload?.version || 1}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleFacilityChange = (e) => {
    const newId = e.target.value;
    setActiveFacilityId(newId);
    localStorage.setItem('activeFacilityId', newId);
  };

  const currentFacility = ALL_10_FACILITIES.find((f) => f.id === activeFacilityId) || ALL_10_FACILITIES[0];

  useEffect(() => {
    // If no facility session exists, redirect to facility directory/login
    const savedFacId = localStorage.getItem('activeFacilityId') || user?.facilityId;
    if (!savedFacId && (!user || user.role !== 'facility')) {
      navigate('/facility/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col justify-between font-sans pb-16 relative selection:bg-orange-500 selection:text-white">
      {/* Subtle Warm Orange Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/60 via-amber-50/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* 1. TOP NAVIGATION & DEDICATED FACILITY IDENTIFIER (White & Orange Theme) */}
      <header className="bg-white/95 border-b border-orange-200/80 sticky top-0 z-40 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand & Active Facility */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-orange-800 uppercase tracking-wider font-mono bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  CPCB Authorized CBMWTF
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  ● Plant Active
                </span>
              </div>
              <h1 className="text-base font-black text-slate-900 tracking-tight truncate max-w-sm sm:max-w-md mt-0.5">
                {facilityData?.facilityName || currentFacility.name}
              </h1>
            </div>
          </div>

          {/* Dedicated Active Facility Badge, Language, Theme & Exit / Switch Action */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-3.5 py-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
              <span className="text-xs font-mono font-black text-orange-900">
                {facilityData?.facilityId || activeFacilityId}
              </span>
              <span className="text-[10px] text-orange-700 font-medium hidden md:inline">
                • {facilityData?.district || currentFacility.district}
              </span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Select Language / భాషను ఎంచుకోండి"
              >
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-semibold hidden sm:inline">
                  {language === 'te' ? 'తెలుగు' : 'English'}
                </span>
                <span className="text-[10px] bg-orange-50 dark:bg-slate-900 text-orange-900 dark:text-orange-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  {language === 'te' ? 'TE' : 'EN'}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      language === 'en'
                        ? 'bg-orange-50 text-orange-900 border border-orange-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('te');
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer mt-1 ${
                      language === 'te'
                        ? 'bg-orange-50 text-orange-900 border border-orange-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>🇮🇳 తెలుగు (Telugu)</span>
                    {language === 'te' && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all shadow-xs cursor-pointer active:scale-95 group"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            <button
              onClick={() => {
                if (logout) logout();
                localStorage.removeItem('activeFacilityId');
                navigate('/facility/login');
              }}
              className="bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700 px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs"
              title="Exit Facility Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Switch Facility</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA (White & Orange Theme) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full flex-1">
        {/* LATEST INTAKE POPUP BANNER */}
        {latestIntakeAlert && (
          <div className="bg-emerald-50/90 border-2 border-emerald-400 rounded-3xl p-5 shadow-lg animate-in slide-in-from-top-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block font-mono">
                  ✓ Real-Time Waste Intake Confirmed
                </span>
                <strong className="text-base font-bold text-slate-900 block mt-0.5">
                  Driver {latestIntakeAlert.driverName} ({latestIntakeAlert.vehicleNumber}) deposited Batch {latestIntakeAlert.batchId}
                </strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Origin: <strong className="text-slate-900">{latestIntakeAlert.hospitalName}</strong> • Load: <span className="text-orange-700 font-bold">{latestIntakeAlert.wasteQuantity} kg ({latestIntakeAlert.wasteCategory})</span> • Tracking Concluded.
                </p>
              </div>
            </div>

            <button
              onClick={() => setLatestIntakeAlert(null)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TOP STATS STRIP (Clean White Cards with Generous Spacing & Orange Accents) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Batches Treated */}
          <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Batches Treated
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <strong className="text-3xl font-black text-slate-900 tracking-tight block">
                {stats.totalBatchesTreated}
              </strong>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-emerald-700 font-semibold">100% CPCB Verified Handover</span>
            </div>
          </div>

          {/* Card 2: Total Weight Treated */}
          <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Weight Treated
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-3xl font-black text-orange-600 tracking-tight">
                {stats.totalWeightKg.toFixed(1)}
              </strong>
              <span className="text-sm font-bold text-slate-500">kg</span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Daily Capacity: 8,500 kg</span>
            </div>
          </div>

          {/* Card 3: High-Temp Incinerators */}
          <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                High-Temp Incinerators
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <strong className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                1,150°C <span className="text-xs sm:text-sm font-bold text-slate-500 font-normal">(3 Active)</span>
              </strong>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Continuous Emission Monitoring</span>
            </div>
          </div>

          {/* Card 4: Arrival Geofence */}
          <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Arrival Geofence
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div>
              <strong className="text-2xl sm:text-3xl font-black text-orange-700 tracking-tight block">
                ≤ 500 Meters
              </strong>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Haversine GPS Radius Active</span>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID: DYNAMIC QR CODE & LIVE INTAKE LOG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: DYNAMIC GATE INTAKE QR CODE (5 COLS - White & Orange) */}
          <div className="lg:col-span-5 bg-white border-2 border-orange-300 rounded-3xl p-6 space-y-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200 font-mono">
                  Dynamic Gate QR v{qrPayload?.version || 1}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Facility Intake Gate QR</h3>
              </div>

              <button
                onClick={handleRegenerateQR}
                disabled={isRotatingQR}
                className="bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                title="Rotate to new secure token"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotatingQR ? 'animate-spin' : ''}`} />
                <span>Rotate QR</span>
              </button>
            </div>

            {/* Crisp High-Contrast White QR Box (Matches Hospital QR for Instant Optical Camera Scanning) */}
            <div className={`bg-white p-5 rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-md border-2 border-orange-200 mx-auto max-w-[290px] transition-all duration-500 ${isRotatingQR ? 'scale-95 opacity-50 ring-4 ring-orange-400' : 'scale-100 opacity-100'}`}>
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                <QRCodeSVG
                  id="facility-gate-qr-svg"
                  value={
                    qrPayload
                      ? JSON.stringify({
                          type: 'DISPOSAL_FACILITY',
                          facilityId: qrPayload.facilityId || activeFacilityId,
                          version: qrPayload.version || 1,
                          token: qrPayload.token || facilityData?.qrToken || 'FAC_RAMKY_SECURE_TOKEN_2026_A98',
                        })
                      : JSON.stringify({
                          type: 'DISPOSAL_FACILITY',
                          facilityId: activeFacilityId,
                          version: 1,
                          token: 'FAC_RAMKY_SECURE_TOKEN_2026_A98',
                        })
                  }
                  size={210}
                  level="M"
                  includeMargin={true}
                />
              </div>

              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1.5">
                  <strong className="text-xs font-black text-slate-900 font-mono">
                    {facilityData?.facilityId || activeFacilityId}
                  </strong>
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-300 font-mono">
                    v{qrPayload?.version || 1}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                  CPCB 2016 Compliant Gate QR • Instant Camera Auto-Scan
                </span>

                {/* Quick Print / Download QR buttons */}
                <div className="flex items-center justify-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition-all cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-orange-600" />
                    <span>Print Label</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CPCB Physical Gate Intake Scanner Notice */}
            <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-orange-950">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>ACTIVE CBMWTF GATE QR TERMINAL</span>
              </div>
              <p className="text-[11px] text-orange-800 leading-snug">
                Incoming drivers scan this QR code with their mobile device camera upon reaching the yard. Waste dumping is recorded, GPS tracking stops, and gate QR auto-rotates to Version {(qrPayload?.version || 1) + 1}.
              </p>
            </div>

            {/* Dynamic Security Token Readout */}
            <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Security Token:</span>
                <span className="font-mono text-orange-800 font-bold truncate max-w-[180px]">
                  {qrPayload?.token || 'FAC_SECURE_TOKEN_2026'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Auto-Rotation:</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Auto-refreshes on every driver scan
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">CPCB Registration:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {facilityData?.cpcbRegistrationNumber || 'CPCB/TSPCB/TG-01'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              💡 Drivers scan this QR code with their mobile device camera upon reaching the dumping yard. The hospital is instantly notified and live GPS tracking concludes.
            </p>
          </div>

          {/* RIGHT: REAL-TIME DEPOSITED WASTE LOG (7 COLS - White & Orange Theme) */}
          <div className="lg:col-span-7 bg-white border-2 border-orange-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-600" />
                  <span>Real-Time Waste Intake & Custody Log</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Live record of all biomedical waste batches received and incinerated at this facility.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-orange-800 bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                {deposits.length} Records
              </span>
            </div>

            {/* Deposits Log Table */}
            {deposits.length === 0 ? (
              <div className="p-8 text-center bg-orange-50/40 rounded-2xl border border-orange-200 space-y-2">
                <Truck className="w-8 h-8 text-orange-400 mx-auto" />
                <strong className="text-sm font-bold text-slate-800 block">
                  Waiting for First Waste Deposit
                </strong>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When a driver transports waste from a hospital and scans this gate QR, the record will instantly appear here with complete driver and batch details.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-orange-100">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-orange-50/80 border-b border-orange-200 text-orange-950 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Carrier Driver</th>
                      <th className="py-2.5 px-3">Origin Hospital</th>
                      <th className="py-2.5 px-3">Batch & Category</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 font-medium text-slate-700">
                    {deposits.map((dep, idx) => (
                      <tr key={dep.orderId || dep.batchId || idx} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 block">{dep.driverName || 'Venkatesh Rao'}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {dep.vehicleNumber || 'TS-09-UB-4501'} • {dep.driverPhone || '9848123456'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-800 block">{dep.hospitalName || 'Gandhi Hospital'}</strong>
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ QR Verified</span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 font-mono block">{dep.batchId || 'BWS-GANDHI-002'}</strong>
                          <span className="text-[10px] font-bold text-orange-700 uppercase">
                            {dep.wasteCategory || 'YELLOW'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-900 font-bold font-mono">
                            {dep.wasteQuantity || dep.quantityKg || 42.5} kg
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Incinerated
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacilityDashboardPage;
