import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { telanganaDistricts, hospitalTypesList } from '../data/telanganaDistricts';
import {
  Building2,
  Search,
  Filter,
  Download,
  Upload,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';

const HospitalManagementPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('All');
  const [ownershipFilter, setOwnershipFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [newHospital, setNewHospital] = useState({
    name: '',
    type: 'Government Hospital',
    ownership: 'Government',
    district: 'Hyderabad',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    latitude: 17.3850,
    longitude: 78.4867,
    bedCapacity: 300,
  });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      let url = `/hospitals?district=${districtFilter}&ownership=${ownershipFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setHospitals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [districtFilter, ownershipFilter]);

  const handleToggleStatus = async (hospitalId, currentStatus) => {
    try {
      const res = await api.put(`/hospitals/${hospitalId}/status`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setHospitals(prev => prev.map(h => h.hospitalId === hospitalId ? { ...h, status: h.status === 'Active' ? 'Inactive' : 'Active' } : h));
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hospitals', newHospital);
      if (res.data.success) {
        showToast('Hospital registered successfully', 'success');
        setIsAddModalOpen(false);
        fetchHospitals();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating hospital', 'error');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/hospitals/export-csv', '_blank');
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast('Importing hospital dataset...', 'info');
      const res = await api.post('/hospitals/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchHospitals();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'CSV Import failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Telangana Hospital Directory & Management
          </h2>
          <p className="text-xs text-slate-500">
            State healthcare database, geo-coordinates, status control, and CSV sync
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCSVImport}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#519755]" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#519755] hover:bg-[#3C733F] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-[#519755]/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Hospital</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchHospitals()}
              placeholder="Search by Hospital Name, ID, District, Superintendent..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            />
          </div>

          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            >
              <option value="All">All 33 Telangana Districts</option>
              {telanganaDistricts.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#519755]"
            >
              <option value="All">All Ownership</option>
              <option value="Government">Government Facilities</option>
              <option value="Private">Private Hospitals</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Found <strong>{hospitals.length}</strong> registered healthcare institutions</span>
          <span>Coverage: <strong>100% of Telangana Districts</strong></span>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Hospital ID</th>
                <th className="py-3.5 px-4">Institution Name</th>
                <th className="py-3.5 px-4">District</th>
                <th className="py-3.5 px-4">Type & Ownership</th>
                <th className="py-3.5 px-4">Phone / Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hospitals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                    No hospitals found matching filters.
                  </td>
                </tr>
              ) : (
                hospitals.map((h) => (
                  <tr key={h._id || h.hospitalId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{h.hospitalId}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{h.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">{h.address}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#3C733F]">{h.district}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-bold block">{h.type}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${h.ownership === 'Government' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {h.ownership}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`tel:${h.phone}`} className="text-slate-800 font-semibold hover:text-blue-600 block">
                        {h.phone}
                      </a>
                      <span className="text-[11px] text-slate-400 truncate block">{h.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${h.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user?.role === 'super_admin' && (
                        <button
                          onClick={() => handleToggleStatus(h.hospitalId, h.status)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            h.status === 'Active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {h.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hospital Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Hospital to Grid</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateHospital} className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  placeholder="e.g. Kakatiya Medical College Hospital"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">District *</label>
                  <select
                    value={newHospital.district}
                    onChange={(e) => setNewHospital({ ...newHospital, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                  >
                    {telanganaDistricts.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ownership *</label>
                  <select
                    value={newHospital.ownership}
                    onChange={(e) => setNewHospital({ ...newHospital, ownership: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newHospital.phone}
                    onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })}
                    placeholder="+91 40 2345 6789"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newHospital.email}
                    onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })}
                    placeholder="hospital@telangana.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                  placeholder="Main Road, Ward No. 5"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#519755] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalManagementPage;
