import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bmwCategories } from '../data/segregationRules';
import SegregationAssistantModal from '../components/SegregationAssistantModal';
import ShinyButton from '../components/reactbits/ShinyButton';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import AnimatedBackground from '../components/reactbits/AnimatedBackground';
import {
  Building2,
  Truck,
  QrCode,
  Sparkles,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  Search,
  Phone,
  BedDouble,
  ExternalLink,
  Award,
  KeyRound,
  FileSpreadsheet,
  Scan,
  Check,
  Zap,
  Radio,
  Flame,
  Factory,
  Heart,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { switchHospital } = useAuth();
  const { showToast } = useNotification();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isSegregationModalOpen, setIsSegregationModalOpen] = useState(false);
  const [selectedBmwCategory, setSelectedBmwCategory] = useState('YELLOW');

  const stats = [
    { label: t('statHospitals', 'Verified Hospitals'), value: t('statHospitalsVal', '12 Facilities'), sub: t('statHospitalsSub', 'Telangana State Network'), color: 'text-[#519755]' },
    { label: t('statWaste', 'Digital Waste Tracked'), value: t('statWasteVal', '1,850+ kg'), sub: t('statWasteSub', 'End-to-End Custody Logged'), color: 'text-amber-600' },
    { label: t('statQR', 'Dynamic QR Security'), value: t('statQRVal', 'v2 Refresh'), sub: t('statQRSub', 'Server Token Protected'), color: 'text-[#BE91BE]' },
    { label: t('statSync', 'Operational Mirror'), value: t('statSyncVal', '100% Synced'), sub: t('statSyncSub', 'Google Sheets & MongoDB'), color: 'text-teal-600' },
  ];

  const features = [
    {
      id: 'segregation',
      title: t('f1Title', '1. Smart Waste Segregation'),
      desc: t('f1Desc', 'Instant rule-based classification matching 60+ clinical items according to CPCB BMW 2016 rules.'),
      icon: Sparkles,
      color: 'from-[#519755] to-[#A8DCAB]',
      badge: t('f1Badge', 'Interactive Tool'),
      clickable: true,
    },
    {
      id: 'qr',
      title: t('f2Title', '2. Dynamic QR Lifecycle'),
      desc: t('f2Desc', 'Auto-refreshing QR codes with server crypto tokens, auto-refreshing on quantity alterations.'),
      icon: QrCode,
      color: 'from-slate-900 to-slate-800',
      badge: t('f2Badge', 'Anti-Tamper'),
      clickable: false,
    },
    {
      id: 'driver',
      title: t('f3Title', '3. Real-Time Driver Booking'),
      desc: t('f3Desc', 'Fleet drivers request jobs; hospitals review driver photo, vehicle & masked credentials to approve.'),
      icon: Truck,
      color: 'from-amber-600 to-amber-500',
      badge: t('f3Badge', 'Live Dispatch'),
      clickable: false,
    },
    {
      id: 'scanner',
      title: t('f4Title', '4. Camera QR Barcode Scanner'),
      desc: t('f4Desc', 'Live camera scanning on hospital bags with custody transfer verification and digital receipts.'),
      icon: Scan,
      color: 'from-emerald-700 to-emerald-600',
      badge: t('f4Badge', 'Camera & File'),
      clickable: false,
    },
    {
      id: 'sheets',
      title: t('f5Title', '5. Google Sheets Live Mirror'),
      desc: t('f5Desc', 'Asynchronous operational mirror for reporting without exposing sensitive passwords or Aadhaar.'),
      icon: FileSpreadsheet,
      color: 'from-[#BE91BE] to-[#9d6b9d]',
      badge: t('f5Badge', 'Cloud Sync'),
      clickable: false,
    },
    {
      id: 'facilities',
      title: t('f6Title', '6. 10 CBMWTF Treatment Yards'),
      desc: t('f6Desc', 'Integrated with 10 official Telangana disposal companies for final autoclaving & incineration.'),
      icon: Factory,
      color: 'from-slate-800 to-[#519755]',
      badge: t('f6Badge', 'CPCB Authorized'),
      clickable: false,
    },
    {
      id: 'blood',
      title: '7. Lifeline Blood & Bank Network',
      desc: 'Real-time blood directory, emergency alerts, donor geolocation radar, bank stock inventory, and encrypted PII privacy vault.',
      icon: Heart,
      color: 'from-rose-600 to-red-500',
      badge: 'Live Sync',
      clickable: true,
      link: '/blood-network',
    },
  ];

  const activeCategoryData = bmwCategories[selectedBmwCategory] || bmwCategories.YELLOW;

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Hero Section with React Bits Animated Background */}
      <AnimatedBackground className="pt-12 pb-20 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">

            {/* Main Title with Glowing Accent */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-2xl">
              HEALTHTECH <span className="bg-gradient-to-r from-[#6ee7b7] via-[#a7f3d0] to-[#34d399] bg-clip-text text-transparent drop-shadow-lg">SMART</span>
            </h1>

            <p className="text-lg sm:text-2xl font-black text-white max-w-3xl mx-auto leading-snug drop-shadow-md">
              {t('heroTitle2', 'Smart Autonomous Medical, Waste & Emergency Health Network')}
            </p>

            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
              {t('heroDesc', 'Digitally unifies clinical ward generation, fleet collection approvals, dynamic QR custody transfers, and CBMWTF high-temperature autoclaving across Telangana.')}
            </p>

            {/* Interactive Hero Action Buttons (React Bits Shiny Buttons) */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <ShinyButton
                variant="emerald"
                size="lg"
                icon={Sparkles}
                onClick={() => setIsSegregationModalOpen(true)}
              >
                <span>{t('segregationGuide', 'OPEN SEGREGATION ASSISTANT')}</span>
              </ShinyButton>

              <Link to="/hospitals">
                <ShinyButton variant="outline" size="lg" icon={Building2}>
                  <span>{t('hospitalPortalBadge', 'HOSPITAL PORTAL')}</span>
                </ShinyButton>
              </Link>

              <Link to="/driver-portal">
                <ShinyButton variant="amber" size="lg" icon={Truck}>
                  <span>{t('driverPortalBadge', 'DRIVER FLEET')}</span>
                </ShinyButton>
              </Link>

              <Link to="/facility/login">
                <ShinyButton variant="purple" size="lg" icon={Factory}>
                  <span>{t('facilityPortalBadge', 'FACILITIES PORTAL')}</span>
                </ShinyButton>
              </Link>

              <Link to="/blood-network">
                <ShinyButton variant="outline" size="lg" icon={Heart} className="border-rose-500/40 text-rose-300 hover:border-rose-400">
                  <span className="text-rose-400 font-black">🩸 BLOOD NETWORK</span>
                </ShinyButton>
              </Link>
            </div>

          </div>

          {/* ========================================================
              3 LARGE INTERACTIVE PORTAL CARDS (SpotlightCard)
              ======================================================== */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            
            {/* 1. HOSPITAL PORTAL SPOTLIGHT CARD */}
            <SpotlightCard
              spotlightColor="rgba(81, 151, 85, 0.22)"
              borderColor="rgba(81, 151, 85, 0.5)"
              className="p-7 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#519755] to-[#3C733F] text-white flex items-center justify-center shadow-lg shadow-[#519755]/30">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2B542D] dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                    {t('twelveHospitals', '12 HOSPITALS')}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {t('hospitalPortal', 'HOSPITAL PORTAL')}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('hospitalPortalDesc', 'Log biomedical waste batches, generate versioned dynamic QR codes, request certified drivers, and review incoming collection requests.')}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#519755] shrink-0" />
                    <span>{t('hospFeat1', 'Dynamic Versioned QR Codes')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#519755] shrink-0" />
                    <span>{t('hospFeat2', '1-Click Driver Dispatch & Approvals')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#519755] shrink-0" />
                    <span>{t('hospFeat3', 'Gandhi, Osmania, NIMS & 12 Pre-Seeded')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <Link to="/hospitals" className="block w-full">
                  <ShinyButton variant="emerald" size="md" className="w-full">
                    <span>{t('enterHospitalPortal', 'ENTER HOSPITAL PORTAL')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShinyButton>
                </Link>
              </div>
            </SpotlightCard>

            {/* 2. DRIVER PORTAL SPOTLIGHT CARD */}
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.22)"
              borderColor="rgba(245, 158, 11, 0.5)"
              className="p-7 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                    {t('collectionFleet', 'COLLECTION FLEET')}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {t('driverPortal', 'DRIVER FIELD CONSOLE')}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('driverPortalDesc', 'Drivers register, sign in, view nearby hospital waste, request collection jobs, and verify loaded biohazard bags with camera barcode scan.')}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{t('driverFeat1', 'Real-Time Hospital Proximity Sorting')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{t('driverFeat2', 'Live Camera Scanner & Barcode Simulator')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{t('driverFeat3', 'Continuous GPS Telemetry & Custody Log')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/driver/register" className="block w-full">
                    <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black py-2.5 px-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95">
                      <span>+ Create Account</span>
                    </button>
                  </Link>
                  <Link to="/driver/login" className="block w-full">
                    <button className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-black py-2.5 px-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95">
                      <span>Driver Login →</span>
                    </button>
                  </Link>
                </div>
                <Link to="/driver-portal" className="block w-full">
                  <ShinyButton variant="amber" size="md" className="w-full">
                    <span>{t('enterDriverPortal', 'ENTER DRIVER FLEET PORTAL')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShinyButton>
                </Link>
              </div>
            </SpotlightCard>

            {/* 3. FACILITIES PORTAL SPOTLIGHT CARD */}
            <SpotlightCard
              spotlightColor="rgba(190, 145, 190, 0.25)"
              borderColor="rgba(190, 145, 190, 0.5)"
              className="p-7 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#BE91BE] to-[#864e86] text-white flex items-center justify-center shadow-lg shadow-[#BE91BE]/30">
                    <Factory className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-300 dark:border-purple-700">
                    {t('tenPlants', '10 CBMWTF PLANTS')}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {t('facilityPortal', 'FACILITIES PORTAL')}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('facilityPortalDesc', 'Authorized treatment & disposal companies (Incineration, Autoclave, Effluent Treatment) for final waste destruction confirmation.')}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#864e86] shrink-0" />
                    <span>{t('facilityFeat1', 'Dynamic Gate QR Code Generation')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#864e86] shrink-0" />
                    <span>{t('facilityFeat2', 'Ramky, Maridi, Multiclave, Medicare & 10 Plants')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#864e86] shrink-0" />
                    <span>{t('facilityFeat3', 'Instant Intake Confirmation & Certificate')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <Link to="/facility/login" className="block w-full">
                  <ShinyButton variant="purple" size="md" className="w-full">
                    <span>{t('enterFacilitiesPortal', 'ENTER FACILITIES PORTAL')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShinyButton>
                </Link>
              </div>
            </SpotlightCard>

          </div>

          {/* Quick Stats Grid with Glowing Counters */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-1 hover:border-[#519755] transition-all"
              >
                <span className={`text-2xl sm:text-3xl font-black block tracking-tight ${s.color}`}>
                  {s.value}
                </span>
                <span className="text-xs font-bold text-slate-800 block">{s.label}</span>
                <span className="text-[10px] text-slate-400 block font-medium">{s.sub}</span>
              </div>
            ))}
          </div>

        </div>
      </AnimatedBackground>

      {/* ========================================================
          INTERACTIVE BMW 2016 CATEGORY EXPLORER (REACT BITS STYLE)
          ======================================================== */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black text-[#519755] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                {t('cpcbRulesBadge', 'CPCB Bio-Medical Waste Rules 2016')}
              </span>
              <h2 className="text-3xl font-black text-slate-950">
                {t('cpcbRulesTitle', 'Interactive Color-Coded Segregation Guide')}
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                {t('cpcbRulesDesc', 'Click across the official 5 BMW categories to inspect segregated waste items, required non-chlorinated containers, and authorized disposal protocols.')}
              </p>
            </div>

            <ShinyButton
              variant="emerald"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsSegregationModalOpen(true)}
            >
              <span>{t('instantItemSearch', 'Instant Item Search Modal')}</span>
            </ShinyButton>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: 'YELLOW', label: t('tabYellow', 'Yellow Stream'), emoji: '🟡', badge: t('tabYellowBadge', 'Infectious / Anatomical') },
              { key: 'RED', label: t('tabRed', 'Red Stream'), emoji: '🔴', badge: t('tabRedBadge', 'Contaminated Plastics') },
              { key: 'WHITE', label: t('tabWhite', 'White Stream'), emoji: '⚪', badge: t('tabWhiteBadge', 'Sharps & Needles') },
              { key: 'BLUE', label: t('tabBlue', 'Blue Stream'), emoji: '🔵', badge: t('tabBlueBadge', 'Glass & Implants') },
              { key: 'GENERAL', label: t('tabGeneral', 'General Stream'), emoji: '🟢', badge: t('tabGeneralBadge', 'Non-Biohazard') },
            ].map((tab) => {
              const isActive = selectedBmwCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedBmwCategory(tab.key)}
                  className={`p-3.5 rounded-2xl text-left transition-all border-2 cursor-pointer flex flex-col justify-between gap-2 btn-tactile ${
                    isActive
                      ? 'border-[#519755] bg-emerald-50/70 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{tab.emoji}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#519755] animate-ping" />
                    )}
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-900 block">{tab.label}</strong>
                    <span className="text-[10px] text-slate-500 block leading-tight">{tab.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Category Inspection Card */}
          <div className="bg-[#F8FAF8] rounded-3xl p-6 sm:p-8 border-2 border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#519755] block">
                  {t('activeStreamDef', 'ACTIVE STREAM DEFINITION')}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {activeCategoryData.title}
                </h3>
              </div>
              <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs">
                {t('treatmentLabel', 'Treatment')}: {activeCategoryData.badgeText}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Packaging & Treatment Details */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                    {t('mandatoryContainer', 'Mandatory Container')}
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {activeCategoryData.container}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                    {t('finalTreatmentMethod', 'Final Treatment Method')}
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {activeCategoryData.treatment}
                  </p>
                </div>
              </div>

              {/* Verified Items List (2 cols) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    {t('officialItemsLogged', 'Official Items Logged Under This Stream')}
                  </span>
                  <button
                    onClick={() => setIsSegregationModalOpen(true)}
                    className="text-[11px] font-bold text-[#519755] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('testRuleEngine', 'Test rule engine')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeCategoryData.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-700 flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-[#519755] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* System Features Section (With Clickable Segregation Trigger) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#519755] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              {t('archBadge', 'Full-Stack Architecture')}
            </span>
            <h2 className="text-3xl font-black text-slate-950">
              {t('govTitle', 'End-to-End Biomedical Waste Governance')}
            </h2>
            <p className="text-sm text-slate-600">
              {t('govSubtitle', 'Engineered according to Bio-Medical Waste Management Rules 2016 and CPCB guidelines.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <SpotlightCard
                  key={i}
                  spotlightColor="rgba(81, 151, 85, 0.16)"
                  className="p-6 space-y-4 cursor-pointer"
                  onClick={() => {
                    if (f.id === 'segregation') {
                      setIsSegregationModalOpen(true);
                    } else if (f.id === 'blood') {
                      navigate('/blood-network');
                    } else if (f.id === 'sheets') {
                      navigate('/app/google-sheets');
                    } else if (f.id === 'facilities') {
                      navigate('/facility/login');
                    } else if (f.id === 'driver' || f.id === 'scanner') {
                      navigate('/driver/dashboard');
                    } else {
                      navigate('/hospitals');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-slate-950">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                  <div className="text-[11px] font-bold text-[#519755] flex items-center gap-1 pt-1">
                    <span>{t('openComponent', 'Open component')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

        </div>
      </section>

      {/* Smart Segregation Modal */}
      <SegregationAssistantModal
        isOpen={isSegregationModalOpen}
        onClose={() => setIsSegregationModalOpen(false)}
      />

    </div>
  );
};

export default LandingPage;
