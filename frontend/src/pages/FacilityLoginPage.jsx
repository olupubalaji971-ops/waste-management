import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import ShinyButton from '../components/reactbits/ShinyButton';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import AnimatedBackground from '../components/reactbits/AnimatedBackground';
import {
  Factory,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Flame,
  Sparkles,
  CheckCircle2,
  MapPin,
  QrCode,
  KeyRound,
  Search,
  Filter,
  Check,
  Copy,
  Zap,
} from 'lucide-react';

export const SAMPLE_FACILITIES = [
  {
    id: 'FAC-TG-001',
    name: 'Ramky Enviro CBMWTF (Dundigal Central Facility)',
    email: 'ramky@biowastesmart.in',
    password: 'Ramky@123',
    address: 'Survey No. 64/1, Bahadurpally & Dundigal Road, Gandimaisamma, Hyderabad, Telangana 500043',
    district: 'Medchal-Malkajgiri',
    type: 'Central CBMWTF',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-01-2026',
    capacityKg: 8500,
    incinerators: 3,
    autoclaves: 4,
    qrToken: 'FAC_RAMKY_SECURE_TOKEN_2026_A98',
  },
  {
    id: 'FAC-TG-002',
    name: 'Maridi Eco Industries CBMWTF Medchal',
    email: 'maridi@biowastesmart.in',
    password: 'Maridi@123',
    address: 'Plot No. 12/A, Industrial Area, Medchal, Hyderabad, Telangana 501401',
    district: 'Medchal',
    type: 'Authorized Incineration Facility',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-02-2026',
    capacityKg: 6000,
    incinerators: 2,
    autoclaves: 3,
    qrToken: 'FAC_MARIDI_SECURE_TOKEN_2026_B74',
  },
  {
    id: 'FAC-TG-003',
    name: 'G.J. Multiclave Bio-Medical Facility Bibinagar',
    email: 'multiclave@biowastesmart.in',
    password: 'Multiclave@123',
    address: 'Sy No. 248, Near AIIMS Campus, Bibinagar, Yadadri Bhuvanagiri, Telangana 508126',
    district: 'Yadadri Bhuvanagiri',
    type: 'Authorized Waste Processing Facility',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-03-2026',
    capacityKg: 7500,
    incinerators: 2,
    autoclaves: 3,
    qrToken: 'FAC_GJMULTI_SECURE_TOKEN_2026_C55',
  },
  {
    id: 'FAC-TG-004',
    name: 'Medicare Environmental Management Pashamylaram',
    email: 'medicare@biowastesmart.in',
    password: 'Medicare@123',
    address: 'Phase III, IDA Pashamylaram, Patancheru, Sangareddy, Telangana 502307',
    district: 'Sangareddy',
    type: 'Biomedical Waste Treatment Facility',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-04-2026',
    capacityKg: 5000,
    incinerators: 2,
    autoclaves: 2,
    qrToken: 'FAC_MEDICARE_SECURE_TOKEN_2026_D21',
  },
  {
    id: 'FAC-TG-005',
    name: 'Clean Enviro Bio-Disposal Cherlapally',
    email: 'cleanenviro@biowastesmart.in',
    password: 'CleanEnviro@123',
    address: 'Plot 88, IDA Cherlapally, Phase II, Hyderabad, Telangana 500051',
    district: 'Medchal-Malkajgiri',
    type: 'High-Temperature Incineration Plant',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-05-2026',
    capacityKg: 6500,
    incinerators: 2,
    autoclaves: 3,
    qrToken: 'FAC_CLEAN_SECURE_TOKEN_2026_E11',
  },
  {
    id: 'FAC-TG-006',
    name: 'Apex Waste Solutions CBMWTF Balanagar',
    email: 'apex@biowastesmart.in',
    password: 'Apex@123',
    address: 'B-14, Industrial Estate, Balanagar, Hyderabad, Telangana 500037',
    district: 'Hyderabad',
    type: 'Common Treatment Facility',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-06-2026',
    capacityKg: 4500,
    incinerators: 1,
    autoclaves: 2,
    qrToken: 'FAC_APEX_SECURE_TOKEN_2026_F90',
  },
  {
    id: 'FAC-TG-007',
    name: 'Telangana Eco-Care Treatment Plant Choutuppal',
    email: 'ecocare@biowastesmart.in',
    password: 'EcoCare@123',
    address: 'NH-65 Highway, Choutuppal, Yadadri Bhuvanagiri, Telangana 508252',
    district: 'Yadadri Bhuvanagiri',
    type: 'Regional Bio-Treatment Plant',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-07-2026',
    capacityKg: 5500,
    incinerators: 2,
    autoclaves: 2,
    qrToken: 'FAC_ECOCARE_SECURE_TOKEN_2026_G33',
  },
  {
    id: 'FAC-TG-008',
    name: 'Warangal Regional Bio-Management Facility',
    email: 'warangalcbmwtf@biowastesmart.in',
    password: 'Warangal@123',
    address: 'Industrial Development Area, Rampur, Warangal, Telangana 506151',
    district: 'Warangal',
    type: 'Zonal CBMWTF Facility',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-08-2026',
    capacityKg: 7000,
    incinerators: 2,
    autoclaves: 3,
    qrToken: 'FAC_WARANGAL_SECURE_TOKEN_2026_H77',
  },
  {
    id: 'FAC-TG-009',
    name: 'Karimnagar Green Waste Treatment Plant',
    email: 'karimnagar@biowastesmart.in',
    password: 'Karimnagar@123',
    address: 'Industrial Area, Bommakal, Karimnagar, Telangana 505001',
    district: 'Karimnagar',
    type: 'Integrated Bio-Waste Plant',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-09-2026',
    capacityKg: 4000,
    incinerators: 1,
    autoclaves: 2,
    qrToken: 'FAC_KARIMNAGAR_SECURE_TOKEN_2026_J12',
  },
  {
    id: 'FAC-TG-010',
    name: 'Nizamabad Bio-Disposal & Incineration Facility',
    email: 'nizamabad@biowastesmart.in',
    password: 'Nizamabad@123',
    address: 'Sarvail Road, Dichpally, Nizamabad, Telangana 503175',
    district: 'Nizamabad',
    type: 'District Treatment Center',
    cpcb: 'CPCB/TSPCB/CBMWTF/TG-10-2026',
    capacityKg: 4200,
    incinerators: 1,
    autoclaves: 2,
    qrToken: 'FAC_NIZAMABAD_SECURE_TOKEN_2026_K44',
  },
];

const FacilityLoginPage = () => {
  const { loginFacility, switchFacility } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedFacility, setSelectedFacility] = useState(SAMPLE_FACILITIES[0]);
  const [email, setEmail] = useState(SAMPLE_FACILITIES[0].email);
  const [password, setPassword] = useState(SAMPLE_FACILITIES[0].password);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const districts = ['All', 'Medchal', 'Hyderabad', 'Yadadri Bhuvanagiri', 'Sangareddy', 'Warangal', 'Karimnagar', 'Nizamabad'];

  const filteredFacilities = SAMPLE_FACILITIES.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.district.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict =
      districtFilter === 'All' || f.district.toLowerCase().includes(districtFilter.toLowerCase());

    return matchesSearch && matchesDistrict;
  });

  const handle1ClickLogin = async (fac) => {
    setSelectedFacility(fac);
    setEmail(fac.email);
    setPassword(fac.password);
    setLoading(true);
    setError('');

    try {
      const res = await loginFacility(fac.email, fac.password, fac.id);
      if (res?.success) {
        showToast(`Authenticated as ${fac.name}! Gate QR Loaded.`, 'success', 'Facility Command Ready');
        navigate('/facility/dashboard');
      }
    } catch (err) {
      // Fallback
      await switchFacility(fac);
      showToast(`Logged in to ${fac.name}`, 'success', 'Demo Mode');
      navigate('/facility/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginFacility(email, password, selectedFacility?.id || 'FAC-TG-001');
      if (res?.success) {
        showToast(`Authenticated as ${res.user?.name || selectedFacility.name}!`, 'success', 'Facility Login');
        navigate('/facility/dashboard');
      } else {
        setError('Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection error or invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-slate-950 font-sans pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#271727] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white transition-colors">
              <span>{t('backToHome', '← Back to Home Portal')}</span>
            </Link>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
              {t('cpcbRulesBadge', 'CPCB BMW RULES 2016 COMPLIANT')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-black">
                <Factory className="w-3.5 h-3.5 text-purple-300" />
                <span>{t('cbmwtfDirectory', 'CBMWTF TREATMENT & DISPOSAL DIRECTORY')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {t('authFacSignIn', 'Authorized Facility Sign-In & Gate QR')}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {t('authFacDesc', 'Choose any of the 10 authorized Telangana biomedical treatment facilities to access individual gate QR codes, verify arriving collection vehicles, and issue custody transfer receipts.')}
              </p>
            </div>
          </div>

          {/* Search & District Filter */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchFacility', 'Search facility name, ID, or district...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 text-white placeholder-slate-400 text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-purple-400 transition-all font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrictFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    districtFilter === d
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t(d, d)}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: 10 Companies + Side Login Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            {t('showing', 'Showing')} {filteredFacilities.length} {t('of', 'of')} {SAMPLE_FACILITIES.length} {t('registeredCbmwtfs', 'Registered CBMWTFs')}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-400 font-mono">
            {t('passwordPattern', 'Password Pattern:')} <strong className="text-purple-700 dark:text-purple-400 font-bold">&lt;FacilityName&gt;@123</strong>
          </span>
        </div>

        {/* 10 Facility Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => {
            return (
              <SpotlightCard
                key={fac.id}
                spotlightColor="rgba(190, 145, 190, 0.22)"
                borderColor="rgba(190, 145, 190, 0.5)"
                className="p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top ID & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-300 px-2.5 py-0.5 rounded-md border border-purple-300 dark:border-purple-800/60 inline-block mb-1">
                        {fac.id} • {fac.district}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {fac.name}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 flex items-center justify-center font-black shrink-0">
                      <Factory className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{fac.address}</p>

                  {/* Capacity & Equipment */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold block">{t('capacity', 'Capacity')}</span>
                      <strong className="text-purple-900 dark:text-purple-300 font-mono text-xs">{fac.capacityKg} {t('kgPerDay', 'kg/day')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold block">{t('equipments', 'Equipments')}</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">
                        {fac.incinerators} {t('incin', 'Incin')}, {fac.autoclaves} {t('auto', 'Auto')}
                      </strong>
                    </div>
                  </div>

                  {/* Sample Credentials Box */}
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-purple-300">{t('sampleEmail', 'Sample Email:')}</span>
                      <strong className="text-slate-900 dark:text-white select-all">{fac.email}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-purple-300">{t('samplePassword', 'Sample Password:')}</span>
                      <strong className="text-purple-800 dark:text-purple-300 font-black select-all">{fac.password}</strong>
                    </div>
                  </div>

                  {/* Gate QR Preview Thumbnail */}
                  <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-1 bg-white qr-code-box border border-slate-200 rounded-lg shrink-0">
                      <QRCodeSVG
                        value={JSON.stringify({ type: 'DISPOSAL_FACILITY', facilityId: fac.id, token: fac.qrToken, version: 1 })}
                        size={48}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <div className="text-[11px] space-y-0.5 overflow-hidden">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-purple-700 dark:text-purple-400" />
                        {t('gateQrToken', 'Gate QR Token')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate select-all">{fac.qrToken}</span>
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-black uppercase">{t('autoRotatesOnScan', 'Auto-Rotates on Driver Scan')}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Login Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <ShinyButton
                    variant="purple"
                    size="sm"
                    className="w-full"
                    onClick={() => handle1ClickLogin(fac)}
                    disabled={loading}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{t('loginTo', 'LOGIN TO')} {fac.name.split(' ')[0].toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ShinyButton>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default FacilityLoginPage;
