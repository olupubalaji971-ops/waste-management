import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import api from '../services/api';
import {
  Scan,
  Camera,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck2,
  ChevronRight,
  Factory,
  Flame,
  Check,
  Radio,
  RefreshCw,
  QrCode,
  FlipHorizontal,
  Lightbulb,
  Upload,
} from 'lucide-react';

const DriverQRScannerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const paramBatchId = searchParams.get('batchId') || 'BWS-GANDHI-2026-0001';
  const paramBookingId = searchParams.get('bookingId') || '';

  // Mode: 'HOSPITAL' (Pick up from hospital) or 'FACILITY' (Drop off at CBMWTF plant)
  const [scannerMode, setScannerMode] = useState(searchParams.get('mode') === 'facility' ? 'FACILITY' : 'HOSPITAL');

  const [scannerActive, setScannerActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [facilityScanResult, setFacilityScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const isProcessingRef = useRef(false);

  const driverProfile = {
    driverId: user?.driverId || user?.id || 'DRV-TS-0101',
    driverName: user?.name || 'Kiran Kumar (TS Bio-Carrier)',
    driverPhone: user?.phone || '+91 98480 22338',
    vehicleNumber: user?.vehicleNumber || 'TS-09-UB-4501',
  };

  // Hidden canvas for pure jsQR analysis
  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
  }, []);

  // Crisp audio chime on detection
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6 chime
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
      if (navigator.vibrate) navigator.vibrate(120);
    } catch (e) {}
  };

  // High-Speed Optical Loop: runs directly from video stream
  const tick = () => {
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      const canvas = canvasRef.current;
      if (canvas && !isProcessingRef.current) {
        isProcessingRef.current = true;

        try {
          const vWidth = video.videoWidth;
          const vHeight = video.videoHeight;

          // Scale to ideal 640px width to eliminate latency and camera noise
          const scale = vWidth > 720 ? 720 / vWidth : 1.0;
          const sw = Math.round(vWidth * scale);
          const sh = Math.round(vHeight * scale);

          canvas.width = sw;
          canvas.height = sh;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, sw, sh);

          const imageData = ctx.getImageData(0, 0, sw, sh);

          // Fast pure-JS QR decoder
          const code = jsQR(imageData.data, sw, sh, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data && code.data.trim().length > 0) {
            playBeep();
            stopCamera();
            handleProcessScan(code.data.trim());
            return;
          }
        } catch (err) {
          // frame pass
        } finally {
          isProcessingRef.current = false;
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(tick);
  };

  // Start hardware camera automatically
  const startCamera = async () => {
    stopCamera();
    setIsLoadingCamera(true);
    setErrorMessage('');

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      try {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      } catch (e) {}

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();

        setIsLoadingCamera(false);
        setScannerActive(true);

        // Start scanning loop immediately
        animFrameIdRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.warn('Camera error in scanner page:', err);
      setIsLoadingCamera(false);
      setScannerActive(false);
      setErrorMessage('Camera access unavailable or permission denied. Please allow camera access in your browser to scan QR codes.');
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScannerActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const newStatus = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: newStatus }],
      });
      setTorchOn(newStatus);
    } catch (e) {}
  };

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File Upload as fallback
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingCamera(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height, {
          inversionAttempts: 'attemptBoth',
        });
        setIsLoadingCamera(false);
        if (code && code.data) {
          playBeep();
          handleProcessScan(code.data.trim());
        } else {
          setErrorMessage('Could not decode QR code from the uploaded image. Please ensure the QR is clear and well-lit.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Process QR scan with universal auto-classification
  const handleProcessScan = async (rawQRText) => {
    setIsScanning(true);
    setErrorMessage('');

    try {
      let isFacilityQR = false;
      let facilityId = 'FAC-TG-001';
      let facilityToken = '';
      let batchId = paramBatchId;
      let qrToken = '';
      let qrVersion = 1;

      // Universal Auto-Detection: determine whether QR is Hospital Batch or Facility Gate
      let detectedType = null;
      try {
        const parsed = typeof rawQRText === 'string' && (rawQRText.startsWith('{') || rawQRText.startsWith('['))
          ? JSON.parse(rawQRText)
          : null;

        if (parsed) {
          if (parsed.type === 'DISPOSAL_FACILITY' || parsed.facilityId) {
            detectedType = 'FACILITY';
            facilityId = parsed.facilityId || facilityId;
            facilityToken = parsed.token || parsed.secureToken || '';
          } else if (parsed.batchId || parsed.hospitalId) {
            detectedType = 'BATCH';
            batchId = parsed.batchId || batchId;
            qrToken = parsed.token || '';
            qrVersion = parsed.version || 1;
          }
        } else if (typeof rawQRText === 'string') {
          const trimmed = rawQRText.trim();
          if (trimmed.startsWith('FAC-') || trimmed.includes('DISPOSAL_FACILITY') || trimmed.includes('FAC_')) {
            detectedType = 'FACILITY';
            if (trimmed.startsWith('FAC-')) facilityId = trimmed;
          } else if (trimmed.startsWith('BWS-') || trimmed.startsWith('HOSP-')) {
            detectedType = 'BATCH';
            batchId = trimmed;
          }
        }
      } catch (e) {}

      // Final classification
      if (detectedType === 'FACILITY') {
        isFacilityQR = true;
      } else if (detectedType === 'BATCH') {
        isFacilityQR = false;
      } else {
        isFacilityQR = scannerMode === 'FACILITY';
      }

      if (isFacilityQR) {
        // EXECUTE FACILITY INTAKE VERIFICATION
        const res = await api.post('/driver/scan-disposal-qr', {
          facilityId,
          secureToken: facilityToken,
          rawQRString: rawQRText,
          driverId: driverProfile.driverId,
          driverName: driverProfile.driverName,
          driverPhone: driverProfile.driverPhone,
          vehicleNumber: driverProfile.vehicleNumber,
        });

        if (res.data?.success) {
          setFacilityScanResult(res.data.data);
          setScanResult(null);
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
          });
          showToast(
            `🎉 FACILITY INTAKE VERIFIED! Driver details logged in ${res.data.data?.facility?.facilityName || facilityId}. Hospital notified!`,
            'success',
            'Disposal Complete'
          );
        }
      } else {
        // EXECUTE HOSPITAL BATCH COLLECTION
        const res = await api.post('/driver/scan-qr', {
          batchId,
          qrToken,
          qrVersion,
          bookingId: paramBookingId,
          rawQRString: rawQRText,
          driverId: driverProfile.driverId,
          driverName: driverProfile.driverName,
          driverPhone: driverProfile.driverPhone,
          vehicleNumber: driverProfile.vehicleNumber,
        });

        if (res.data?.success) {
          setScanResult(res.data.data);
          setFacilityScanResult(null);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          showToast('✓ HOSPITAL & BATCH QR VERIFIED! Custody transfer logged in database & Google Sheets.', 'success', 'Verified');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'QR Verification failed. Please check that the QR code is authorized.';
      setErrorMessage(msg);
      showToast(msg, 'error', 'Scan Error');
      // Restart camera after error
      setTimeout(() => {
        startCamera();
      }, 2000);
    } finally {
      setIsScanning(false);
    }
  };

  const isFacilityMode = scannerMode === 'FACILITY';

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16 font-sans max-w-5xl mx-auto space-y-6 px-3 sm:px-6 pt-4">
      
      {/* Header */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link to="/driver/dashboard" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              <span>← Back to Driver Console</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Scan className="w-7 h-7 text-emerald-400" />
              <span>BioWaste Smart Mobile QR Scanner</span>
            </h1>
            <p className="text-xs text-slate-300">
              High-speed optical camera scanner for Hospital Waste Collection Bags and CBMWTF Treatment Plant Gate QRs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Authorized Driver: <strong>{driverProfile.driverName}</strong></span>
          </div>
        </div>

        {/* SCANNER MODE TOGGLE TABS */}
        <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setScannerMode('HOSPITAL');
              setErrorMessage('');
              if (!scannerActive) startCamera();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              scannerMode === 'HOSPITAL'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Hospital Waste Bag Scanner (Pick Up)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerMode('FACILITY');
              setErrorMessage('');
              if (!scannerActive) startCamera();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              scannerMode === 'FACILITY'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>2. Treatment Facility Gate QR (Drop Off)</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Optical Camera Viewfinder (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className={`w-4 h-4 ${isFacilityMode ? 'text-orange-600' : 'text-emerald-600'}`} />
                <span>
                  {isFacilityMode ? 'CBMWTF Gate QR Optical Viewfinder' : 'Hospital Bag QR Optical Viewfinder'}
                </span>
              </h2>
              {scannerActive && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE OPTICAL AUTO-SCAN
                </span>
              )}
            </div>

            {/* Video Viewport */}
            <div className="relative w-full aspect-square max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
              
              {/* Direct Hardware Video */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Initializing Spinner */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs text-slate-300 font-bold">Activating optical camera...</span>
                </div>
              )}

              {/* Laser Scanning Reticle */}
              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                  <div className="relative w-56 h-56 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-pulse my-auto mt-28" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold bg-slate-950/90 px-3.5 py-1 rounded-full border border-emerald-500/50 mt-3 backdrop-blur-md">
                    ⚡ Show QR Code to Camera for Instant Auto-Scan
                  </span>
                </div>
              )}

              {/* Fallback Restart Button if Stopped */}
              {!scannerActive && !isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-3 z-20 p-6 text-center">
                  <Camera className="w-10 h-10 text-emerald-400" />
                  <span className="text-white text-sm font-bold">Camera is paused</span>
                  <button
                    onClick={startCamera}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Restart Camera Scanner
                  </button>
                </div>
              )}
            </div>

            {/* Camera Control Toolbar (Torch, Flip Camera, Upload Photo) */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FlipHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>Flip Camera</span>
                </button>

                {hasTorch && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`font-bold text-xs px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                      torchOn ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{torchOn ? 'Flashlight On' : 'Flashlight'}</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload QR Photo</span>
              </button>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Scan Verification Receipt & Custody Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {facilityScanResult ? (
            /* SUCCESSFUL FACILITY INTAKE RECEIPT - WASTE DUMPED */
            <div className="bg-white rounded-3xl p-6 border-2 border-orange-500 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
              
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-200">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-orange-950">WASTE DUMPED SUCCESSFULLY ✓</h3>
                  <p className="text-xs text-orange-800">CBMWTF facility intake registered • GPS tracking concluded.</p>
                </div>
              </div>

              {/* Digital Facility Custody Receipt Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-400 uppercase text-[10px]">
                  <span>Intake Audit Field</span>
                  <span>Verified Value</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Treatment Plant:</span>
                  <strong className="text-slate-900">{facilityScanResult.facility?.facilityName || facilityScanResult.intake?.disposalFacilityName || 'Ramky Enviro CBMWTF'}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Facility ID:</span>
                  <span className="font-mono font-bold text-orange-700">{facilityScanResult.facility?.facilityId || facilityScanResult.intake?.disposalFacilityId || 'FAC-TG-001'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Driver Name:</span>
                  <strong className="text-slate-900">{facilityScanResult.driverDetails?.driverName || driverProfile.driverName}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle Number:</span>
                  <span className="font-mono font-bold text-slate-900">{facilityScanResult.driverDetails?.vehicleNumber || driverProfile.vehicleNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Waste Batch:</span>
                  <strong className="text-slate-900 font-mono">{facilityScanResult.intake?.batchId || facilityScanResult.order?.batchId}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Origin Hospital:</span>
                  <strong className="text-slate-900">{facilityScanResult.intake?.hospitalName || facilityScanResult.order?.hospitalName}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Weight & Category:</span>
                  <strong className="text-orange-700 text-sm font-black">
                    {facilityScanResult.intake?.wasteQuantity || 42.5} kg ({facilityScanResult.intake?.wasteCategory || 'YELLOW'})
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Treatment Method:</span>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    1150°C Incineration & Sterilization
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Dynamic Gate QR:</span>
                  <span className="bg-orange-100 text-orange-900 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                    Auto-rotated to Version {facilityScanResult.facility?.qrVersion || facilityScanResult.refreshedQR?.version || 2}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">3 Portals Synchronized:</span>
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    Hospital • Driver • Facility Updated
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Disposal Confirmation Broadcasted:</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  "Bio-waste batch successfully dumped and treated. Real-time confirmation delivered across Hospital, Driver, and Facility portals."
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Link
                  to="/facility/dashboard"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-xs font-bold text-center transition-all shadow-xs"
                >
                  View in Facility Portal
                </Link>
                <Link
                  to="/driver/dashboard"
                  className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl text-xs font-bold text-center transition-all shadow-xs"
                >
                  Back to Driver Console
                </Link>
              </div>

            </div>
          ) : scanResult ? (
            /* Successful Hospital Collection Receipt Card - ORDER CONFIRMED & IN TRANSIT */
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
              
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-emerald-950">ORDER CONFIRMED • IN TRANSIT 🚛</h3>
                  </div>
                  <p className="text-xs text-emerald-800">Hospital QR verified • Continuous GPS tracking active to facility.</p>
                </div>
              </div>

              {/* Digital Custody Receipt Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-400 uppercase text-[10px]">
                  <span>Receipt Field</span>
                  <span>Verified Value</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Order Status:</span>
                  <span className="bg-emerald-100 text-emerald-900 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                    ORDER_CONFIRMED • IN_TRANSIT
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Waste Batch:</span>
                  <strong className="text-slate-900 font-mono">{scanResult.batch?.batchId}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital:</span>
                  <strong className="text-slate-900">{scanResult.batch?.hospitalName}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Waste Category:</span>
                  <strong className="text-amber-800">{scanResult.batch?.category} Stream ({scanResult.batch?.quantity || scanResult.batch?.quantityKg} kg)</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Driver / Vehicle:</span>
                  <span className="font-semibold text-slate-900">{scanResult.scanRecord?.driverName || driverProfile.driverName} ({driverProfile.vehicleNumber})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <strong className="text-orange-700">Ramky Enviro CBMWTF Central Plant</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Continuous GPS:</span>
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-700 animate-pulse" />
                    Active Live Stream
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">3 Portals Updated:</span>
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    ✓ Hospital, Driver & Facility Notified
                  </span>
                </div>
              </div>

              {/* NEXT STEP CALL TO ACTION: SCAN FACILITY GATE QR */}
              <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-300 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-orange-950">
                  <Factory className="w-4 h-4 text-orange-600" />
                  <span>STEP 2: SCAN FACILITY GATE QR</span>
                </div>
                <p className="text-[11px] text-orange-800 leading-snug">
                  Navigate to the CBMWTF treatment facility and scan the entrance Gate QR code with camera to confirm waste dumping and stop tracking.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScannerMode('FACILITY');
                    setScanResult(null);
                    setFacilityScanResult(null);
                    setErrorMessage('');
                    startCamera();
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 px-4 rounded-xl text-xs font-black text-center transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Factory className="w-4 h-4" />
                  <span>Scan Facility Gate QR Now 🏭</span>
                </button>
                <Link
                  to="/driver/dashboard"
                  className="bg-slate-900 hover:bg-black text-white py-3.5 px-4 rounded-xl text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-orange-400" />
                  <span>Live GPS Journey</span>
                </Link>
              </div>

            </div>
          ) : (
            /* Awaiting Scan State */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  {isFacilityMode ? 'Awaiting CBMWTF Gate QR' : 'Awaiting Hospital Bag QR'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isFacilityMode
                    ? 'Point camera at the Gate QR displayed at the treatment facility entrance to automatically register intake.'
                    : 'Point camera at the QR code tag attached to the hospital waste bag to verify custody transfer.'}
                </p>
              </div>

              <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-[#519755]" />
                  <span>Security Checks Executed on Scan:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                  <li>Live Camera Frame Auto-Detection</li>
                  <li>Hospital Waste Registry Verification</li>
                  <li>CBMWTF Authorized Facility Gate Authentication</li>
                  <li>Driver Identity & Telemetry Sync</li>
                  <li>Instant Real-Time Socket.io Notification Broadcast</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default DriverQRScannerPage;
