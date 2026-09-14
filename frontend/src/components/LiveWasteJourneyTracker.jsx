import React, { useState, useEffect } from 'react';
import {
  Truck,
  Building2,
  Factory,
  Radio,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Clock,
  Gauge,
  Compass,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react';

const LiveWasteJourneyTracker = ({
  order = {},
  liveLocation = {},
  portalType = 'HOSPITAL', // 'HOSPITAL' or 'DRIVER'
  onArrivedFacility = null,
  onOpenDisposalScanner = null,
}) => {
  const [progressPercent, setProgressPercent] = useState(45);

  // Derive active details
  const orderId = order.requestId || order.orderId || 'REQ-602798';
  const batchId = order.batchId || 'BWS-GANDHI-002';
  const hospitalName = order.hospitalName || order.acceptedHospitalName || 'Gandhi Hospital';
  const facilityName = order.disposalFacilityName || 'Ramky Enviro CBMWTF (Dundigal)';
  const driverName = order.driverName || 'Venkatesh Rao';
  const driverPhone = order.driverPhone || '9848123456';
  const vehicleNumber = order.vehicleNumber || 'TS-09-UB-4501';
  const driverPhoto = order.driverPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  const wasteQuantity = order.wasteQuantity || order.quantityKg || order.quantity || 42.5;
  const wasteCategory = order.wasteCategory || order.category || 'YELLOW';
  const wasteType = order.wasteType || 'Infectious Biohazard Waste';
  const status = order.status || 'IN_TRANSIT';

  const latitude = liveLocation.latitude || 17.4409;
  const longitude = liveLocation.longitude || 78.4965;
  const speed = liveLocation.speed || 38;

  // Smooth continuous route progression
  useEffect(() => {
    if (status === 'COMPLETED' || status === 'DISPOSAL_QR_VERIFIED') {
      setProgressPercent(100);
    } else if (status === 'ARRIVED_AT_DISPOSAL_FACILITY') {
      setProgressPercent(94);
    } else if (status === 'IN_TRANSIT') {
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 90) return 25;
          return prev + 3.5;
        });
      }, 3500);
      return () => clearInterval(interval);
    } else {
      setProgressPercent(20);
    }
  }, [status]);

  const distanceRemainingKm = Math.max(0.4, ((100 - progressPercent) * 0.18).toFixed(1));
  const etaMinutes = Math.max(2, Math.round(distanceRemainingKm * 1.5));

  return (
    <div className="bg-[#0B1118] text-slate-100 rounded-3xl p-6 sm:p-7 border border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. CLEAN SLEEK HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Waste Journey
              </span>
              <span className="text-xs text-slate-500 font-mono">#{orderId}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              Continuous GPS Tracking & Transit Verification
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {status === 'IN_TRANSIT' ? '🚛 En Route to CBMWTF' : status === 'ARRIVED_AT_DISPOSAL_FACILITY' ? '🏢 Arrived at Facility' : status}
          </span>
        </div>
      </div>

      {/* 2. HERO TRANSIT CORRIDOR VISUALIZER */}
      <div className="bg-[#070B10] rounded-2xl p-5 sm:p-6 border border-slate-800/80 space-y-5">
        {/* Origin & Destination Labels */}
        <div className="flex items-center justify-between text-xs">
          {/* Origin Hospital */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Origin</span>
              <strong className="text-sm font-bold text-white block">{hospitalName}</strong>
              <span className="text-[10px] text-emerald-400/90 font-medium">✓ QR Verified & Handed Over</span>
            </div>
          </div>

          {/* Dynamic Moving Badge */}
          <div className="hidden sm:flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Speed</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              {speed} km/h • ETA ~{etaMinutes}m
            </span>
          </div>

          {/* Destination CBMWTF */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Destination CBMWTF</span>
              <strong className="text-sm font-bold text-white block truncate max-w-[170px] sm:max-w-xs">
                {facilityName}
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">Arrival Geofence: ≤ 500m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-amber-400 shrink-0">
              <Factory className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Moving Progress Corridor Bar */}
        <div className="relative py-2">
          {/* Track Line */}
          <div className="w-full h-2.5 bg-slate-800/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Moving Vehicle Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 flex items-center justify-center"
            style={{ left: `${Math.max(6, Math.min(94, progressPercent))}%` }}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Truck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Unified Sleek Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">GPS Coordinates</span>
            <span className="font-mono text-emerald-300 font-bold text-xs mt-0.5">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Remaining Distance</span>
            <span className="font-mono text-white font-bold text-xs mt-0.5">
              {distanceRemainingKm} km
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Arrival</span>
            <span className="font-mono text-emerald-300 font-bold text-xs mt-0.5">
              ~{etaMinutes} minutes
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Authorized Corridor</span>
            <span className="text-slate-300 font-medium text-xs mt-0.5 truncate">
              Medchal Express Route
            </span>
          </div>
        </div>
      </div>

      {/* 3. TWO BALANCED CARDS: DRIVER & WASTE CUSTODY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Driver Details */}
        <div className="bg-[#070B10] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
          <img
            src={driverPhoto}
            alt="Driver"
            className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0"
          />
          <div className="overflow-hidden">
            <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-wider block">
              Authorized Carrier
            </span>
            <strong className="text-sm font-bold text-white block truncate">{driverName}</strong>
            <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
              Vehicle: <strong className="text-slate-200">{vehicleNumber}</strong> • {driverPhone}
            </p>
          </div>
        </div>

        {/* Waste Custody & QR Verification */}
        <div className="bg-[#070B10] p-4 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Waste Custody</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              ✓ Token Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Batch ID:</span>
            <strong className="text-emerald-300 font-mono">{batchId}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Load Weight & Type:</span>
            <span className="text-white font-bold">
              {wasteQuantity} kg • <span className="text-amber-300">{wasteCategory}</span> ({wasteType})
            </span>
          </div>
        </div>
      </div>

      {/* 4. DRIVER PORTAL ACTIONS (Only shown in driver portal) */}
      {portalType === 'DRIVER' && status === 'IN_TRANSIT' && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            Arrived at Dundigal facility? Scan facility QR to complete geofence check.
          </span>
          <div className="flex items-center gap-2">
            {onArrivedFacility && (
              <button
                onClick={onArrivedFacility}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                I Have Reached Facility
              </button>
            )}
            {onOpenDisposalScanner && (
              <button
                onClick={onOpenDisposalScanner}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                Scan Facility QR (≤ 500m)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWasteJourneyTracker;
