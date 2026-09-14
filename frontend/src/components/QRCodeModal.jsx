import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Printer, X, ShieldCheck, Calendar, Weight, Building2 } from 'lucide-react';

const QRCodeModal = ({ isOpen = true, onClose, batch }) => {
  const printRef = useRef(null);

  if (!batch || isOpen === false) return null;

  const qrValue = typeof batch.qrCodeData === 'string' && batch.qrCodeData.length > 0
    ? batch.qrCodeData
    : JSON.stringify({
        batchId: batch.batchId,
        hospitalId: batch.hospitalId,
        category: batch.category,
        quantity: batch.quantity || batch.quantityKg,
        version: batch.qrVersion || 1,
        token: batch.qrToken || 'tok_sec_2026',
        date: batch.date || new Date().toISOString().split('T')[0],
      });

  const getCategoryBadgeClass = (category) => {
    switch (category?.toUpperCase()) {
      case 'YELLOW': return 'bg-amber-500 text-white';
      case 'RED': return 'bg-red-500 text-white';
      case 'WHITE': return 'bg-slate-700 text-white';
      case 'BLUE': return 'bg-blue-600 text-white';
      default: return 'bg-emerald-600 text-white';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-svg-code');
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
        downloadLink.download = `QRCode-${batch.batchId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#519755]" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Official Bio-Waste Dynamic QR Label
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">CPCB Bio-Medical Waste (Management) Rules, 2016</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Container */}
        <div id="printable-qr-section" className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2 text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Batch Identifier</span>
              <p className="font-extrabold text-base text-slate-900 font-mono">{batch.batchId}</p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${getCategoryBadgeClass(batch.category)}`}>
                {batch.category} STREAM
              </span>
              <span className="block text-[10px] font-mono text-emerald-800 font-bold mt-0.5">
                Version {batch.qrVersion || 1}
              </span>
            </div>
          </div>

          {/* QR Code SVG - Crisp, High-Contrast Level M for Instant Camera Detection */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-[260px] mx-auto my-2">
            <div className="p-2 bg-white rounded-xl">
              <QRCodeSVG
                id="qr-svg-code"
                value={qrValue}
                size={220}
                level="M"
                includeMargin={true}
              />
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mt-2">
              ⚡ Optimized for Instant Camera Auto-Scan
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Hospital ID</span>
              <span className="font-bold text-slate-800 truncate block">{batch.hospitalId}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Net Weight</span>
              <span className="font-bold text-slate-900">{batch.quantityKg || batch.quantity || 0} {batch.unit || 'kg'}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 col-span-2">
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Waste Description</span>
              <span className="font-semibold text-slate-800 text-[11px] truncate block">{batch.wasteType || 'Infectious Biohazard Waste'}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 col-span-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Date: {batch.date || new Date().toISOString().split('T')[0]} • {batch.time || ''}</span>
              <span className="font-bold text-[#519755]">CPCB 2016 Compliant ✓</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-[#519755] hover:bg-[#3C733F] text-white py-3 rounded-xl text-xs font-black shadow-md shadow-[#519755]/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
