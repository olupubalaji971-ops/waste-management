import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LiveVehicleMap from '../components/LiveVehicleMap';
import {
  Truck,
  MapPin,
  Building2,
  Phone,
  Navigation,
  Activity,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const VehicleTrackingPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        const [hospRes, vehRes] = await Promise.all([
          api.get('/hospitals'),
          api.get('/vehicles'),
        ]);

        if (hospRes.data.success) setHospitals(hospRes.data.data);
        if (vehRes.data.success) {
          setVehicles(vehRes.data.data);
          if (vehRes.data.data.length > 0) {
            setSelectedVehicle(vehRes.data.data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live GPS Fleet Tracking & GIS Simulation</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry, hazardous bio-carrier routing, and hospital collection waypoints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-[#A8DCAB]/40 text-[#2B542D] text-xs font-extrabold px-3 py-1 rounded-full border border-[#519755]/30">
            {vehicles.length} Fleet Units Active
          </span>
        </div>
      </div>

      {/* Map Canvas with Simulation */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-md">
        <LiveVehicleMap
          hospitals={hospitals}
          vehicles={vehicles}
          activeVehicleId={selectedVehicle?._id}
          centerPos={[17.42, 78.48]}
          zoomLevel={12}
        />
      </div>

      {/* Fleet Vehicles Status Cards */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
          Collection Fleet Vehicles Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((v) => (
            <div
              key={v._id}
              onClick={() => setSelectedVehicle(v)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedVehicle?._id === v._id
                  ? 'bg-[#F6FAF6] border-[#519755] shadow-md ring-2 ring-[#A8DCAB]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">{v.vehicleNumber}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.status === 'Collecting' || v.status === 'En Route'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium truncate mb-2">{v.vehicleType}</p>

              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                <p><span className="font-semibold text-slate-400">Driver:</span> {v.driverName}</p>
                <p><span className="font-semibold text-slate-400">Phone:</span> {v.driverPhone}</p>
                <p><span className="font-semibold text-slate-400">Capacity:</span> {v.currentLoadKg || 0} / {v.capacityKg} kg</p>
                <p><span className="font-semibold text-slate-400">District:</span> {v.assignedDistrict}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default VehicleTrackingPage;
