import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  AlertTriangle,
  Users,
  Building2,
  Phone,
  MapPin,
  Search,
  Filter,
  Star,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Radio,
  Share2,
  Navigation,
  Copy,
  Plus,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  Check,
  RotateCcw,
  Hospital,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../services/lifelineSupabase';
import {
  maskPhoneNumber,
  maskName,
  generateVerificationHash,
  verifyVaultPin,
  VAULT_DEFAULT_PIN,
} from '../services/cryptoVault';
import { useTheme } from '../context/ThemeContext';

// Blood Group Lists and Compatibility Guide
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMPATIBILITY_MATRIX = {
  'A+': { canReceive: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
  'A-': { canReceive: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
  'B+': { canReceive: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
  'B-': { canReceive: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
  'AB+': { canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canDonateTo: ['AB+'] },
  'AB-': { canReceive: ['AB-', 'A-', 'B-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
  'O+': { canReceive: ['O+', 'O-'], canDonateTo: ['O+', 'A+', 'B+', 'AB+'] },
  'O-': { canReceive: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
};

const OFFICIAL_HELPLINES = [
  { name: 'Red Cross Blood Bank Helpline', phone: '1910', note: 'National Toll-Free 24x7' },
  { name: 'e-RaktKosh Central Registry', phone: '011-23739412', note: 'MoHFW Central Dispatch' },
  { name: 'AIIMS Apex Trauma Blood Bank', phone: '011-26593250', note: 'Emergency Critical Support' },
  { name: 'National Emergency Medical Service', phone: '108', note: 'State Ambulance & Critical Response' },
];

export default function LifelineBloodDashboard() {
  const { theme, toggleTheme } = useTheme();

  // Data State
  const [donors, setDonors] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Geolocation
  const [userLocation, setUserLocation] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'NEARBY' | 'BANKS'
  const [searchCity, setSearchCity] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL'); // 'ALL' | 'FREE' | 'READY' | 'ELIGIBLE' | 'UNIVERSAL' | 'STARRED'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT' | 'FREE' | 'DONATIONS'

  // Starred Donors (saved in localStorage)
  const [starredDonors, setStarredDonors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lifeline_starred_donors') || '[]');
    } catch {
      return [];
    }
  });

  // Encryption & Privacy Vault Mode State
  const [isVaultEncrypted, setIsVaultEncrypted] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Modals
  const [modals, setModals] = useState({
    matrix: false,
    helplines: false,
    donorForm: false,
    urgentForm: false,
    bankForm: false,
    orderModal: false,
  });

  // Selected Blood Bank for Ordering Stock
  const [selectedBank, setSelectedBank] = useState(null);

  // Form States
  const [donorForm, setDonorForm] = useState({
    name: '',
    group: 'A+',
    city: '',
    phone: '',
    date: '',
    count: 1,
    fee: '',
    lat: null,
    lng: null,
  });

  const [urgentForm, setUrgentForm] = useState({
    name: '',
    group: 'O+',
    hospital: '',
    phone: '',
  });

  const [bankForm, setBankForm] = useState({
    name: '',
    group: 'A+',
    units: 1,
    cost: 0,
    city: '',
    phone: '',
  });

  const [orderForm, setOrderForm] = useState({
    patientName: '',
    units: 1,
    hospital: '',
    contact: '',
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [donorsRes, urgentRes, banksRes] = await Promise.all([
        supabase.from('donors').select('*').order('created_at', { ascending: false }),
        supabase.from('urgent_requests').select('*').gte('created_at', past24Hours).order('created_at', { ascending: false }),
        supabase.from('blood_bank_inventory').select('*').order('units_available', { ascending: false }),
      ]);

      if (donorsRes.data) setDonors(donorsRes.data);
      if (urgentRes.data) setUrgentRequests(urgentRes.data);
      if (banksRes.data) setBloodBanks(banksRes.data);
    } catch (err) {
      console.error('Error fetching Lifeline data:', err);
      toast.error('Failed to sync live blood network records');
    } finally {
      setLoading(false);
    }
  };

  // Real-time setup
  useEffect(() => {
    fetchData();

    // Get current GPS coords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.log('Geolocation unavailable or denied:', err.message)
      );
    }

    // Subscribe to real-time changes
    const channel = supabase
      .channel('lifeline-realtime-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'urgent_requests' }, (payload) => {
        setUrgentRequests((prev) => [payload.new, ...prev]);
        toast((t) => (
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-bold text-red-600 text-sm">Emergency Broadcast Alert!</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {payload.new.patient_name} needs {payload.new.blood_group} blood
              </p>
            </div>
          </div>
        ), { duration: 6000 });

        if (navigator.vibrate) {
          navigator.vibrate([300, 150, 300]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save starred donors to localStorage
  const toggleStarDonor = (id) => {
    const updated = starredDonors.includes(id)
      ? starredDonors.filter((item) => item !== id)
      : [...starredDonors, id];
    setStarredDonors(updated);
    localStorage.setItem('lifeline_starred_donors', JSON.stringify(updated));
    toast.success(updated.includes(id) ? 'Donor saved to starred favorites' : 'Donor removed from starred');
  };

  // Haversine Distance Formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(6371 * c * 10) / 10; // km
  };

  // Days since last donation calculation
  const getDaysSinceLastDonation = (dateStr) => {
    if (!dateStr) return 999;
    const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filtered Donors
  const filteredDonors = useMemo(() => {
    let result = donors.filter((donor) => {
      // Exclude reported
      if ((donor.report_count || 0) >= 3) return false;

      // City filter
      if (searchCity && !donor.city.toLowerCase().includes(searchCity.toLowerCase().trim())) {
        return false;
      }

      // Blood group filter
      if (selectedGroup !== 'ALL' && donor.blood_group !== selectedGroup) {
        return false;
      }

      // Quick filter
      const fee = Number(donor.fee_amount || 0);
      const days = getDaysSinceLastDonation(donor.last_donated_date);

      if (quickFilter === 'FREE' && fee > 0) return false;
      if (quickFilter === 'READY' && donor.is_available === false) return false;
      if (quickFilter === 'ELIGIBLE' && days < 90) return false;
      if (quickFilter === 'UNIVERSAL' && donor.blood_group !== 'O-') return false;
      if (quickFilter === 'STARRED' && !starredDonors.includes(donor.id)) return false;

      return true;
    });

    // Nearby calculations
    if (activeTab === 'NEARBY' && userLocation) {
      result = result
        .filter((d) => d.lat && d.lng)
        .map((d) => ({
          ...d,
          distance: calculateDistance(userLocation.lat, userLocation.lng, d.lat, d.lng),
        }))
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    // Sort order
    if (sortBy === 'FREE') {
      result.sort((a, b) => Number(a.fee_amount || 0) - Number(b.fee_amount || 0));
    } else if (sortBy === 'DONATIONS') {
      result.sort((a, b) => (b.donation_count || 0) - (a.donation_count || 0));
    }

    // Always bubble starred to top if in default view
    if (quickFilter !== 'STARRED') {
      result.sort((a, b) => (starredDonors.includes(b.id) ? 1 : 0) - (starredDonors.includes(a.id) ? 1 : 0));
    }

    return result;
  }, [donors, searchCity, selectedGroup, quickFilter, sortBy, activeTab, userLocation, starredDonors]);

  // Filtered Blood Banks
  const filteredBanks = useMemo(() => {
    return bloodBanks.filter((bank) => {
      if (searchCity && !bank.city.toLowerCase().includes(searchCity.toLowerCase().trim())) {
        return false;
      }
      if (selectedGroup !== 'ALL' && bank.blood_group !== selectedGroup) {
        return false;
      }
      return true;
    });
  }, [bloodBanks, searchCity, selectedGroup]);

  // Metrics
  const uniqueCitiesCount = useMemo(() => {
    const allCities = [...donors, ...bloodBanks].map((item) => item.city?.trim().toLowerCase()).filter(Boolean);
    return new Set(allCities).size;
  }, [donors, bloodBanks]);

  const totalStockUnits = useMemo(() => {
    return bloodBanks.reduce((sum, item) => sum + (Number(item.units_available) || 0), 0);
  }, [bloodBanks]);

  // Form Submissions
  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(donorForm.phone)) {
      return toast.error('Please enter a valid 10-digit mobile number');
    }

    try {
      const payload = {
        full_name: donorForm.name,
        blood_group: donorForm.group,
        city: donorForm.city,
        phone_number: donorForm.phone,
        last_donated_date: donorForm.date || null,
        is_available: true,
        donation_count: Number(donorForm.count) || 1,
        fee_amount: donorForm.fee === '' ? 0 : Number(donorForm.fee),
        lat: donorForm.lat || null,
        lng: donorForm.lng || null,
      };

      const { error } = await supabase.from('donors').insert([payload]);
      if (error) throw error;

      toast.success('Donor profile registered successfully in Lifeline Network!');
      setModals((prev) => ({ ...prev, donorForm: false }));
      setDonorForm({
        name: '',
        group: 'A+',
        city: '',
        phone: '',
        date: '',
        count: 1,
        fee: '',
        lat: null,
        lng: null,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to register donor: ' + err.message);
    }
  };

  const handleBroadcastUrgent = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(urgentForm.phone)) {
      return toast.error('Please enter a valid 10-digit contact number');
    }

    try {
      const payload = {
        patient_name: urgentForm.name,
        blood_group: urgentForm.group,
        hospital_name: urgentForm.hospital,
        contact_number: urgentForm.phone,
      };

      const { error } = await supabase.from('urgent_requests').insert([payload]);
      if (error) throw error;

      toast.success('Emergency Broadcast published across the network!');
      setModals((prev) => ({ ...prev, urgentForm: false }));
      setUrgentForm({ name: '', group: 'O+', hospital: '', phone: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish emergency broadcast: ' + err.message);
    }
  };

  const handleAddBankStock = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(bankForm.phone)) {
      return toast.error('Please enter a valid 10-digit helpline phone');
    }

    try {
      const payload = {
        facility_name: bankForm.name,
        blood_group: bankForm.group,
        units_available: Number(bankForm.units),
        cost_per_unit: Number(bankForm.cost) || 0,
        city: bankForm.city,
        phone_number: bankForm.phone,
      };

      const { error } = await supabase.from('blood_bank_inventory').insert([payload]);
      if (error) throw error;

      toast.success('Blood bank stock registered successfully!');
      setModals((prev) => ({ ...prev, bankForm: false }));
      setBankForm({ name: '', group: 'A+', units: 1, cost: 0, city: '', phone: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add blood bank stock: ' + err.message);
    }
  };

  const handleOrderStock = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(orderForm.contact)) {
      return toast.error('Please enter a valid 10-digit contact number');
    }
    if (orderForm.units > selectedBank.units_available) {
      return toast.error('Requested units exceed available inventory stock');
    }

    try {
      // 1. Post urgent request notice
      await supabase.from('urgent_requests').insert([
        {
          patient_name: `${orderForm.patientName} (Order from ${selectedBank.facility_name})`,
          blood_group: selectedBank.blood_group,
          hospital_name: orderForm.hospital,
          contact_number: orderForm.contact,
        },
      ]);

      // 2. Decrement bank stock
      const updatedUnits = selectedBank.units_available - Number(orderForm.units);
      await supabase
        .from('blood_bank_inventory')
        .update({ units_available: updatedUnits })
        .eq('id', selectedBank.id);

      toast.success('Blood order placed and dispatched successfully!');
      setModals((prev) => ({ ...prev, orderModal: false }));
      setSelectedBank(null);
      setOrderForm({ patientName: '', units: 1, hospital: '', contact: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order: ' + err.message);
    }
  };

  const handleResolveUrgent = async (id) => {
    try {
      await supabase.from('urgent_requests').delete().eq('id', id);
      toast.success('Emergency request marked resolved / fulfilled');
      fetchData();
    } catch (err) {
      toast.error('Failed to resolve request: ' + err.message);
    }
  };

  // Vault PIN Verification
  const handleUnlockVault = (e) => {
    e.preventDefault();
    if (verifyVaultPin(pinInput)) {
      setIsVaultEncrypted(false);
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError('');
      toast.success('🔓 Encrypted Privacy Shield unmasked with Master PIN');
    } else {
      setPinError('Invalid Vault PIN. Default security PIN is: 2026');
    }
  };

  const copyToClipboard = (text, label = 'Phone number') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toaster position="top-right" />

      {/* Top Banner & Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Return to Main HealthTech Smart Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/30">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
                  Lifeline<span className="text-rose-600">Blood</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    Directory
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Emergency Blood & Bank Inventory Network • Live Real-time Sync
              </p>
            </div>
          </div>

          {/* Right Header Controls: Encrypted Vault Mode, Dark Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Vault Encryption Mode Badge */}
            <button
              onClick={() => {
                if (isVaultEncrypted) {
                  setIsPinModalOpen(true);
                } else {
                  setIsVaultEncrypted(true);
                  toast.success('🛡️ Encrypted PII Shield activated');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                isVaultEncrypted
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
              }`}
              title="Toggle End-to-End PII Encryption / Masking Mode"
            >
              {isVaultEncrypted ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xs:inline">Vault:</span>
                  <span>ENCRYPTED</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="hidden xs:inline">Vault:</span>
                  <span>UNMASKED</span>
                </>
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Donors</span>
              <Users className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
              {loading ? '...' : donors.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Registered & Verified</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Active Alerts
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black mt-2 text-rose-600 dark:text-rose-400">
              {loading ? '...' : urgentRequests.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Past 24h Broadcasts</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Cities Covered</span>
              <MapPin className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
              {loading ? '...' : uniqueCitiesCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Multi-district Reach</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bank Stock</span>
              <Building2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
              {loading ? '...' : `${totalStockUnits} Units`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for Dispatch</p>
          </div>
        </div>

        {/* Action Bar: 108 Emergency, Compatibility, Helplines, Register Donor, Broadcast, Add Bank */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="tel:108"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-red-500/25 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>🚑 108 Emergency</span>
          </a>

          <button
            type="button"
            onClick={() => setModals((m) => ({ ...m, matrix: true }))}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>🩸 Compatibility</span>
          </button>

          <button
            type="button"
            onClick={() => setModals((m) => ({ ...m, helplines: true }))}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>📞 Helplines</span>
          </button>

          <button
            type="button"
            onClick={() => setModals((m) => ({ ...m, donorForm: true }))}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Register Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setModals((m) => ({ ...m, urgentForm: true }))}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>📢 Broadcast</span>
          </button>

          <button
            type="button"
            onClick={() => setModals((m) => ({ ...m, bankForm: true }))}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Hospital className="w-4 h-4" />
            <span>🏥 Add Bank</span>
          </button>
        </div>

        {/* URGENT EMERGENCY BROADCAST BANNER */}
        {urgentRequests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                Live Urgent Blood Broadcasts ({urgentRequests.length})
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Click to respond</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-xs">
                          {req.blood_group}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {isVaultEncrypted ? maskName(req.patient_name) : req.patient_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                        <Hospital className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.hospital_name}</span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">
                          {isVaultEncrypted ? maskPhoneNumber(req.contact_number) : req.contact_number}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <a
                        href={`tel:${req.contact_number}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl text-center shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `URGENT BLOOD REQUIREMENT: Patient ${req.patient_name} (${req.blood_group}) at ${req.hospital_name}. Contact: ${req.contact_number}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl text-center shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Share2 className="w-3 h-3" /> Share
                      </a>
                      <button
                        onClick={() => handleResolveUrgent(req.id)}
                        className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-xl text-center transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directory Controls: Tabs, Search & Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Main Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-rose-500" />
              <span>Donors Directory ({donors.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('NEARBY');
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  });
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'NEARBY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4 text-sky-500" />
              <span>📍 Near Me Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('BANKS')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'BANKS'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>🏥 Blood Banks ({bloodBanks.length})</span>
            </button>
          </div>

          {/* Search bar & Blood group selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, area, or district..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              {searchCity && (
                <button
                  onClick={() => setSearchCity('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            >
              <option value="ALL">ALL BLOOD GROUPS</option>
              {BLOOD_GROUPS.map((grp) => (
                <option key={grp} value={grp}>
                  {grp} GROUP
                </option>
              ))}
            </select>

            {/* Quick Sorter */}
            {activeTab !== 'BANKS' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              >
                <option value="DEFAULT">Sort: Default</option>
                <option value="FREE">Sort: Free First</option>
                <option value="DONATIONS">Sort: Most Donated</option>
              </select>
            )}
          </div>

          {/* Quick Filter Chips (for Donors view) */}
          {activeTab !== 'BANKS' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ALL', label: '🔍 All Donors' },
                { id: 'FREE', label: '💚 Free Only' },
                { id: 'READY', label: '🟢 Ready Now' },
                { id: 'ELIGIBLE', label: '✅ Eligible (>=90d)' },
                { id: 'UNIVERSAL', label: '🩸 O- Universal' },
                { id: 'STARRED', label: '⭐ Starred Favorites' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setQuickFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    quickFilter === chip.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DIRECTORY CONTENT */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm font-bold text-slate-500">Connecting to Lifeline Blood Realtime Network...</p>
          </div>
        ) : activeTab === 'BANKS' ? (
          /* BLOOD BANKS TAB */
          <div className="space-y-4">
            {filteredBanks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="mt-3 text-sm font-bold text-slate-500">No blood bank inventory matched your filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                          {bank.facility_name}
                        </h3>
                        <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-black px-2 py-0.5 rounded-lg">
                          {bank.blood_group}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="capitalize">{bank.city}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {bank.units_available} Units Available
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {bank.cost_per_unit === 0 ? '💚 Free' : `💰 ₹${bank.cost_per_unit} / unit`}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <a
                        href={`tel:${bank.phone_number}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Bank
                      </a>
                      <button
                        onClick={() => {
                          setSelectedBank(bank);
                          setModals((m) => ({ ...m, orderModal: true }));
                        }}
                        disabled={bank.units_available <= 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          bank.units_available > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        📦 Order Stock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* DONORS LIST TAB (ALL & NEARBY) */
          <div className="space-y-4">
            {filteredDonors.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="mt-3 text-sm font-bold text-slate-500">No registered donors matched your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonors.map((donor) => {
                  const daysSince = getDaysSinceLastDonation(donor.last_donated_date);
                  const isEligible = daysSince >= 90;
                  const isStarred = starredDonors.includes(donor.id);

                  return (
                    <div
                      key={donor.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative ${
                        isStarred
                          ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400/20'
                          : 'border-slate-200/90 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Header: Name, Star & Group */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleStarDonor(donor.id)}
                              className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                              title={isStarred ? 'Unstar donor' : 'Star donor'}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                                }`}
                              />
                            </button>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {isVaultEncrypted ? maskName(donor.full_name) : donor.full_name || 'Anonymous Donor'}
                            </h3>
                          </div>

                          <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-xs">
                            {donor.blood_group}
                          </span>
                        </div>

                        {/* Badges: Fee, Donation Count, Distance */}
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px] font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {Number(donor.fee_amount || 0) === 0 ? '💚 Free' : `💰 ₹${donor.fee_amount}`}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-500" />
                            {donor.donation_count || 1}x Donated
                          </span>
                          {donor.distance !== undefined && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-sky-600 dark:text-sky-400 flex items-center gap-0.5 font-extrabold">
                                📍 {donor.distance} km away
                              </span>
                            </>
                          )}
                        </div>

                        {/* Location and Contact */}
                        <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="capitalize">{donor.city || 'Location unlisted'}</span>
                          </p>
                          <p className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {isVaultEncrypted ? maskPhoneNumber(donor.phone_number) : donor.phone_number}
                            </span>
                          </p>
                        </div>

                        {/* Status Pills */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap text-[10px] font-extrabold uppercase">
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              donor.is_available === false
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {donor.is_available === false ? '● Unavailable' : '● Ready Now'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              isEligible
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {isEligible ? '✅ Eligible' : `⏳ ${90 - daysSince}d cooldown`}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons: Call, WhatsApp, Route, Copy */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-4 gap-1.5">
                        <a
                          href={`tel:${donor.phone_number}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow-xs transition-colors flex items-center justify-center"
                          title="Call Donor"
                        >
                          Call
                        </a>
                        <a
                          href={`https://wa.me/91${donor.phone_number}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow-xs transition-colors flex items-center justify-center"
                          title="WhatsApp Donor"
                        >
                          WA
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (donor.lat && donor.lng) {
                              window.open(`https://maps.google.com/?q=${donor.lat},${donor.lng}`, '_blank');
                            } else {
                              window.open(
                                `https://maps.google.com/?q=${encodeURIComponent(donor.city || '')}`,
                                '_blank'
                              );
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                          title="Route on Google Maps"
                        >
                          Route
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(donor.phone_number)}
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-xl text-center transition-colors flex items-center justify-center cursor-pointer"
                          title="Copy Phone Number"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================= MODALS ======================= */}

      {/* 1. BLOOD COMPATIBILITY MATRIX MODAL */}
      {modals.matrix && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Blood Group Compatibility Guide
                </h3>
              </div>
              <button
                onClick={() => setModals((m) => ({ ...m, matrix: false }))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries(COMPATIBILITY_MATRIX).map(([grp, info]) => (
                <div
                  key={grp}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 text-xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-rose-600 text-white font-black px-2 py-0.5 rounded-md text-xs">
                      {grp}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Compatibility Matrix</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong className="text-emerald-600 dark:text-emerald-400">Can Receive From:</strong>{' '}
                    {info.canReceive.join(', ')}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    <strong className="text-sky-600 dark:text-sky-400">Can Donate To:</strong>{' '}
                    {info.canDonateTo.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setModals((m) => ({ ...m, matrix: false }))}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close Compatibility Guide
            </button>
          </div>
        </div>
      )}

      {/* 2. OFFICIAL HELPLINES MODAL */}
      {modals.helplines && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Official Blood Bank Helplines
                </h3>
              </div>
              <button
                onClick={() => setModals((m) => ({ ...m, helplines: false }))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {OFFICIAL_HELPLINES.map((line) => (
                <div
                  key={line.name}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{line.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{line.note}</p>
                  </div>
                  <a
                    href={`tel:${line.phone}`}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{line.phone}</span>
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => setModals((m) => ({ ...m, helplines: false }))}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close Helplines
            </button>
          </div>
        </div>
      )}

      {/* 3. REGISTER DONOR MODAL */}
      {modals.donorForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Register as Blood Donor</h3>
              </div>
              <button
                onClick={() => setModals((m) => ({ ...m, donorForm: false }))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={donorForm.group}
                    onChange={(e) => setDonorForm({ ...donorForm, group: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  >
                    {BLOOD_GROUPS.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={donorForm.city}
                    onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Donated Date</label>
                  <input
                    type="date"
                    value={donorForm.date}
                    onChange={(e) => setDonorForm({ ...donorForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fee (₹) (Blank = Free)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={donorForm.fee}
                    onChange={(e) => setDonorForm({ ...donorForm, fee: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>
              </div>

              {/* Tag GPS Location */}
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setDonorForm((prev) => ({
                          ...prev,
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                        }));
                        toast.success('📍 Current GPS location tagged successfully!');
                      },
                      (err) => toast.error('Geolocation error: ' + err.message)
                    );
                  }
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  donorForm.lat && donorForm.lng
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {donorForm.lat && donorForm.lng
                    ? `GPS Tagged (${donorForm.lat.toFixed(3)}, ${donorForm.lng.toFixed(3)})`
                    : '📍 Tag Current GPS Location'}
                </span>
              </button>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Save Donor Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. BROADCAST EMERGENCY REQUEST MODAL */}
      {modals.urgentForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Broadcast Emergency Blood Request
                </h3>
              </div>
              <button
                onClick={() => setModals((m) => ({ ...m, urgentForm: false }))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastUrgent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Reddy"
                  value={urgentForm.name}
                  onChange={(e) => setUrgentForm({ ...urgentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Required Blood Group</label>
                <select
                  value={urgentForm.group}
                  onChange={(e) => setUrgentForm({ ...urgentForm, group: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hospital Name & City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yashoda Hospital, Secunderabad"
                  value={urgentForm.hospital}
                  onChange={(e) => setUrgentForm({ ...urgentForm, hospital: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">10-Digit Emergency Contact</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={urgentForm.phone}
                  onChange={(e) => setUrgentForm({ ...urgentForm, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                Publish Emergency Broadcast
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD BLOOD BANK INVENTORY MODAL */}
      {modals.bankForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-600">
                  <Hospital className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Add Blood Bank Stock</h3>
              </div>
              <button
                onClick={() => setModals((m) => ({ ...m, bankForm: false }))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBankStock} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hospital / Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Cross Blood Trust"
                  value={bankForm.name}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={bankForm.group}
                    onChange={(e) => setBankForm({ ...bankForm, group: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    {BLOOD_GROUPS.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Units Available</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    value={bankForm.units}
                    onChange={(e) => setBankForm({ ...bankForm, units: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cost per Unit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free"
                    value={bankForm.cost}
                    onChange={(e) => setBankForm({ ...bankForm, cost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={bankForm.city}
                    onChange={(e) => setBankForm({ ...bankForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">10-Digit Helpline Phone</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={bankForm.phone}
                  onChange={(e) => setBankForm({ ...bankForm, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                Publish Stock Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. ORDER BLOOD STOCK MODAL */}
      {modals.orderModal && selectedBank && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-emerald-600 dark:text-emerald-400">
                  📦 Order Stock from {selectedBank.facility_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Group: <b>{selectedBank.blood_group}</b> • In Stock: <b>{selectedBank.units_available} units</b>
                </p>
              </div>
              <button
                onClick={() => setModals((m) => ({ ...m, orderModal: false }))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderStock} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. V. Krishna"
                  value={orderForm.patientName}
                  onChange={(e) => setOrderForm({ ...orderForm, patientName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Units Needed</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBank.units_available}
                    required
                    value={orderForm.units}
                    onChange={(e) => setOrderForm({ ...orderForm, units: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hospital Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Care Hospital"
                    value={orderForm.hospital}
                    onChange={(e) => setOrderForm({ ...orderForm, hospital: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">10-Digit Contact Phone</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={orderForm.contact}
                  onChange={(e) => setOrderForm({ ...orderForm, contact: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Confirm & Reserve Order
                </button>
                <button
                  type="button"
                  onClick={() => setModals((m) => ({ ...m, orderModal: false }))}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PIN MODAL FOR VAULT UNMASKING */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Authorise Unmasking</h3>
                  <p className="text-[10px] text-slate-500">Security PIN Protection</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUnlockVault} className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your Clinical Authorization PIN to reveal unmasked phone numbers and patient identifiers.
              </p>

              <div>
                <input
                  type="password"
                  autoFocus
                  required
                  maxLength={6}
                  placeholder="Enter PIN (Default: 2026)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {pinError && <p className="text-[11px] text-rose-500 font-bold mt-1.5 text-center">{pinError}</p>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Unmask PII
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setPinInput('');
                    setPinError('');
                  }}
                  className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
