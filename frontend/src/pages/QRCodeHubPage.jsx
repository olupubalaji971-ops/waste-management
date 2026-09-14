import React, { useState, useEffect } from 'react';
import api from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import {
  QrCode,
  Search,
  Scan,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const QRCodeHubPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [qrLookupCode, setQrLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        const res = await api.get('/waste');
        if (res.data.success) {
          setBatches(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  const handleScanLookup = async (e) => {
    e.preventDefault();
    if (!qrLookupCode.trim()) return;

    try {
      const res = await api.get(`/waste/qr/${encodeURIComponent(qrLookupCode.trim())}`);
      if (res.data.success) {
        setLookupResult(res.data.data);
      }
    } catch (err) {
      // Find in current batch list
      const found = batches.find(b => b.batchId.toLowerCase() === qrLookupCode.trim().toLowerCase());
      if (found) {
        setLookupResult(found);
      } else {
        alert('No matching medical waste batch found for this QR token');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bio-Waste QR Code Hub & Scanner Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Generate, print disposal slips, or scan QR barcodes to verify hazardous stream contents
          </p>
        </div>
      </div>

      {/* QR Scanner / Lookup Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-wildflower-mint" />
          <h3 className="font-extrabold text-base text-white">
            Simulated Handheld QR Barcode Scanner
          </h3>
        </div>
        <p className="text-xs text-slate-300 max-w-xl">
          Enter any Batch ID (or scan string) to simulate the field driver handheld terminal scanning a physical bag.
        </p>

        <form onSubmit={handleScanLookup} className="flex gap-2 max-w-lg">
          <input
            type="text"
            value={qrLookupCode}
            onChange={(e) => setQrLookupCode(e.target.value)}
            placeholder="e.g. WB-20260829-1001"
            className="flex-1 px-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#519755]"
          />
          <button
            type="submit"
            className="bg-[#519755] hover:bg-[#3C733F] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Tag</span>
          </button>
        </form>

        {/* Lookup Result Card */}
        {lookupResult && (
          <div className="mt-4 p-4 bg-slate-800/90 rounded-2xl border border-emerald-500/50 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-400 text-sm">✅ Verified BMW Batch: {lookupResult.batchId}</span>
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{lookupResult.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-2 border-t border-slate-700">
              <div><span className="text-slate-400 block text-[10px]">Hospital:</span> <strong className="text-white">{lookupResult.hospitalId}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Category:</span> <strong className="text-white">{lookupResult.category}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Weight:</span> <strong className="text-white">{lookupResult.quantity} kg</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Logged Date:</span> <strong className="text-white">{lookupResult.date}</strong></div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedBatch(lookupResult)}
                className="text-xs text-wildflower-mint font-bold hover:underline"
              >
                Open Full Printable Slip →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batches QR Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
          Hospital Waste Batches with Generated QR Codes ({batches.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => (
            <div
              key={b.batchId}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{b.batchId}</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    {b.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">{b.wasteType}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{b.quantity} {b.unit || 'kg'}</span>
                  <span>{b.date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedBatch(b)}
                  className="flex-1 bg-slate-900 hover:bg-black text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Preview & Print</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        batch={selectedBatch}
      />

    </div>
  );
};

export default QRCodeHubPage;
