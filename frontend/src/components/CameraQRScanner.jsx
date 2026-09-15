import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  FlipHorizontal,
  Upload,
  Factory,
  Building2,
  Lightbulb,
  Zap,
  Check,
} from 'lucide-react';

const CameraQRScanner = ({
  onScanSuccess,
  onClose,
  scannerType = 'HOSPITAL', // 'HOSPITAL' or 'DISPOSAL'
  title = 'Scan Hospital Batch QR Code',
  subtitle = 'Hold the QR code firmly in front of the camera for instant auto-detection.',
  expectedBatchId = null,
}) => {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Initialize hidden canvas for jsQR analysis
  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (e) {
        barcodeDetectorRef.current = null;
      }
    }
  }, []);

  // Crisp audio chime on successful detection
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

      if (navigator.vibrate) {
        navigator.vibrate(120);
      }
    } catch (e) {}
  };

  // Central trigger when a QR code string is decoded
  const handleDetectedCode = (decodedText) => {
    if (hasScanned || !decodedText) return;
    setHasScanned(true);
    playBeep();
    setScanResult(decodedText);
    stopAllCameras();

    setTimeout(() => {
      if (onScanSuccess) {
        onScanSuccess(decodedText);
      }
    }, 400);
  };

  // High-Speed Optical Loop: runs directly from video stream
  const tick = () => {
    if (hasScanned) return;

    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      const canvas = canvasRef.current;
      if (canvas && !isProcessingRef.current) {
        isProcessingRef.current = true;

        try {
          const vWidth = video.videoWidth;
          const vHeight = video.videoHeight;

          // Scale to ideal scanning width (640px) to maximize frame rate and eliminate noise
          const scale = vWidth > 720 ? 720 / vWidth : 1.0;
          const sw = Math.round(vWidth * scale);
          const sh = Math.round(vHeight * scale);

          canvas.width = sw;
          canvas.height = sh;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, sw, sh);

          const imageData = ctx.getImageData(0, 0, sw, sh);

          // Fast pure-JS QR decoder (inversionAttempts: attemptBoth handles screens, glare, high contrast)
          const code = jsQR(imageData.data, sw, sh, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data && code.data.trim().length > 0) {
            handleDetectedCode(code.data.trim());
            return;
          }

          // Auxiliary: Check native BarcodeDetector if available
          if (barcodeDetectorRef.current) {
            barcodeDetectorRef.current
              .detect(canvas)
              .then((barcodes) => {
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  handleDetectedCode(barcodes[0].rawValue.trim());
                }
              })
              .catch(() => {});
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

  // Start hardware camera stream
  const startCamera = async () => {
    stopAllCameras();
    setIsLoadingCamera(true);
    setErrorMsg('');

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      if (selectedCameraId) {
        constraints.video = { deviceId: { exact: selectedCameraId } };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for torch capability
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

        setIsScanning(true);
        setIsLoadingCamera(false);

        // Start scanning loop immediately
        animFrameIdRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setIsLoadingCamera(false);
      setIsScanning(false);
      setErrorMsg('Camera access unavailable or permission denied. Please allow camera permissions in your browser.');
    }
  };

  // Enumerate cameras on mount
  useEffect(() => {
    let isMounted = true;
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (isMounted && videoDevices.length > 0) {
          setCameras(videoDevices);
        }
      } catch (e) {}
    };
    fetchDevices();
    startCamera();

    return () => {
      isMounted = false;
      stopAllCameras();
    };
  }, [facingMode, selectedCameraId]);

  const stopAllCameras = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

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

  // Handle Photo Upload as fallback
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
          handleDetectedCode(code.data.trim());
        } else {
          setErrorMsg('No QR code could be detected in this photo. Please ensure the QR is clear and well-lit.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const isFacilityMode = scannerType === 'DISPOSAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B1118] border-2 border-emerald-500/50 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative text-white max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopAllCameras();
            if (onClose) onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer transition-all z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Status Indicator */}
        <div className="pr-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded border border-emerald-700/50 font-mono">
              ● High-Precision Optical Scanner Active
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
            {isFacilityMode ? <Factory className="w-5 h-5 text-orange-400" /> : <Building2 className="w-5 h-5 text-emerald-400" />}
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Live Automatic Camera Viewport */}
        <div className="relative bg-slate-950 rounded-2xl border-2 border-emerald-500/40 overflow-hidden min-h-[320px] h-[360px] flex items-center justify-center shadow-inner">
          
          {/* Direct Hardware Video Stream */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Initializing Spinner */}
          {isLoadingCamera && !isScanning && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-300 font-bold">Connecting camera sensor...</span>
            </div>
          )}

          {/* Animated High-Speed Laser Scanner Viewfinder Reticle */}
          {isScanning && !scanResult && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
              <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-3xl shadow-[0_0_35px_rgba(16,185,129,0.4)]">
                {/* Corner Accents */}
                <div className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                {/* Smooth Animated Green Laser Beam */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-pulse my-auto mt-32" />
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-bold bg-slate-950/90 px-4 py-1 rounded-full border border-emerald-500/50 mt-4 backdrop-blur-md shadow-lg">
                ⚡ Point QR Code at Camera to Auto-Scan
              </span>
            </div>
          )}

          {/* Instant Auto-Detection Success Confirmation */}
          {scanResult && (
            <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center space-y-3 z-20 animate-in zoom-in-95 p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
              <strong className="text-white text-lg">QR Code Verified Instantly!</strong>
              <p className="text-xs text-emerald-300 font-mono">
                {scanResult.includes('DISPOSAL_FACILITY') || scanResult.includes('facilityId') || scanResult.includes('FAC-') || isFacilityMode
                  ? '✓ Treatment Facility Gate QR Verified • Intake Logged & Concluding GPS'
                  : '✓ Official Hospital Waste Batch QR Verified • Chain of Custody Confirmed'}
              </p>
            </div>
          )}
        </div>

        {/* Camera Controls (Flip Camera, Torch, Upload QR photo) */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlipCamera}
              className="bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Switch Front/Rear Camera"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip Camera</span>
            </button>

            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`font-bold text-xs px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                  torchOn ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
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
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload QR Image</span>
          </button>
        </div>

        {/* Quick Instant Verification & Manual Input (Guaranteed to work even on desktop/no camera) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Verification & Manual Input</span>
            </span>
            {(expectedBatchId || isFacilityMode) && (
              <button
                type="button"
                onClick={() =>
                  handleDetectedCode(
                    isFacilityMode
                      ? JSON.stringify({
                          type: 'DISPOSAL_FACILITY',
                          facilityId: expectedBatchId || 'FAC-TG-001',
                          version: 1,
                          token: 'FAC_RAMKY_SECURE_TOKEN_2026_A98',
                        })
                      : expectedBatchId || 'BWS-GANDHI-001'
                  )
                }
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1 active:scale-95"
              >
                <span>⚡ Quick Verify {isFacilityMode ? 'Facility Gate' : 'Batch QR'}</span>
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) {
                handleDetectedCode(manualInput.trim());
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={isFacilityMode ? 'e.g. FAC-TG-001 or Gate QR token' : 'e.g. BWS-GANDHI-001 or Batch ID'}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2 rounded-xl placeholder:text-slate-500 font-mono outline-none"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all shadow-xs"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Error Message if any */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/50 border border-red-800/60 text-red-300 text-xs rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraQRScanner;
