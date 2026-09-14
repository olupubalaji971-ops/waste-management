import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  FileSpreadsheet,
  RefreshCw,
  Download,
  Search,
  ShieldCheck,
  Building2,
  Truck,
  QrCode,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  Factory,
} from 'lucide-react';

const GoogleSheetsMirrorPage = () => {
  const [activeTab, setActiveTab] = useState('QRScans');
  const [sheetsData, setSheetsData] = useState({
    Hospitals: [],
    Drivers: [],
    WasteBatches: [],
    DriverRequests: [],
    QRScans: [],
    Collections: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useNotification();

  const fetchSheetsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/google-sheets');
      if (res.data?.success) {
        setSheetsData(res.data.data);
      }
    } catch (err) {
      console.warn('Sheets fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetsData();
  }, []);

  const tabs = [
    { key: 'Disposal_Logs', label: 'Disposal Logs (Full Journey)', count: sheetsData.Disposal_Logs?.length || 0, icon: Factory },
    { key: 'Collections', label: 'Collections Log', count: sheetsData.Collections?.length || 0, icon: CheckCircle2 },
    { key: 'QRScans', label: 'QRScans Log', count: sheetsData.QRScans?.length || 0, icon: QrCode },
    { key: 'Disposal_Facilities', label: 'Authorized Facilities', count: sheetsData.Disposal_Facilities?.length || 0, icon: Building2 },
    { key: 'WasteBatches', label: 'WasteBatches', count: sheetsData.WasteBatches?.length || 0, icon: Layers },
    { key: 'DriverRequests', label: 'DriverRequests', count: sheetsData.DriverRequests?.length || 0, icon: Clock },
    { key: 'Drivers', label: 'Drivers (Masked)', count: sheetsData.Drivers?.length || 0, icon: Truck },
    { key: 'Hospitals', label: 'Hospitals', count: sheetsData.Hospitals?.length || 0, icon: Building2 },
  ];

  const currentRows = (sheetsData[activeTab] || []).filter((row) => {
    if (!search) return true;
    return JSON.stringify(row).toLowerCase().includes(search.toLowerCase());
  });

  const handleDownloadCSV = () => {
    if (currentRows.length === 0) {
      showToast('No rows to export', 'info', 'Export CSV');
      return;
    }
    const headers = Object.keys(currentRows[0]).join(',');
    const rows = currentRows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google_sheets_${activeTab.toLowerCase()}_mirror.csv`;
    a.click();
    showToast(`Exported ${activeTab} to CSV`, 'success', 'Downloaded');
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/40 uppercase">
                Operational Logging Mirror
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                Resilient Async Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
              <span>Google Sheets Operational Mirror</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time sanitized operational logs synchronized automatically on every batch creation, driver request, and QR scan collection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSheetsData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-2xl border border-slate-700 transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Sheets</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Security Alert */}
        <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Data Privacy Compliant:</strong> Zero plaintext passwords stored. Aadhaar numbers and driver licenses are masked to 4 digits across all reporting sheets.
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{t.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sheet Content Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Sheet Table: <span className="text-emerald-700 font-mono">{activeTab}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Showing {currentRows.length} synchronized row records
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filter ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Dynamic Table */}
        {currentRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            No rows logged yet for {activeTab}. Perform actions in the application to generate real-time rows.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  {Object.keys(currentRows[0]).map((col) => (
                    <th key={col} className="p-3.5 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                    {Object.entries(row).map(([key, val], cIdx) => (
                      <td key={cIdx} className="p-3.5 whitespace-nowrap">
                        {key === 'status' ? (
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {String(val)}
                          </span>
                        ) : key.toLowerCase().includes('date') || key.toLowerCase().includes('time') ? (
                          <span className="font-mono text-slate-500 text-[11px]">{String(val)}</span>
                        ) : (
                          <span className="font-semibold text-slate-800">{String(val)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default GoogleSheetsMirrorPage;
