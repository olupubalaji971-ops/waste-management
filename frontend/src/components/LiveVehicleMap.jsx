import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Navigation, Play, Pause, RotateCcw, MapPin, Building2, Phone, ShieldCheck } from 'lucide-react';

// Custom Map Center Updater
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom Leaflet Icons
const createHospitalIcon = (ownership) => {
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="
        background: ${ownership === 'Private' ? '#3B82F6' : '#519755'};
        color: white;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border-radius: 12px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
      ">
        🏥
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createVehicleIcon = (status) => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        background: #0F172A;
        border: 2px solid #A8DCAB;
        box-shadow: 0 0 15px rgba(81, 151, 85, 0.6);
        border-radius: 14px;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        animation: pulse 2s infinite;
      ">
        🚛
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

const LiveVehicleMap = ({
  hospitals = [],
  vehicles = [],
  activeVehicleId = null,
  centerPos = [17.42, 78.48],
  zoomLevel = 12,
  onVehicleClick = null,
}) => {
  const [isSimulating, setIsSimulating] = useState(true);
  const [simStep, setSimStep] = useState(0);

  // Waypoints for live vehicle simulation along Hyderabad medical corridor
  const simulatedRoute = [
    { lat: 17.4239, lng: 78.5034, name: 'Gandhi Hospital (Musheerabad)' },
    { lat: 17.4120, lng: 78.4890, name: 'Tank Bund Road' },
    { lat: 17.3995, lng: 78.4632, name: 'Niloufer Hospital (Lakdikapul)' },
    { lat: 17.4012, lng: 78.4619, name: 'MNJ Cancer Hospital' },
    { lat: 17.3905, lng: 78.4421, name: 'Sarojini Devi Eye Hospital' },
    { lat: 17.3753, lng: 78.4770, name: 'Osmania General Hospital' },
    { lat: 17.3850, lng: 78.4867, name: 'Amberpet Bio-Treatment Plant' },
  ];

  // Simulation tick
  useEffect(() => {
    let timer;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimStep((prev) => (prev + 1) % simulatedRoute.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isSimulating, simulatedRoute.length]);

  const currentVehiclePos = [
    simulatedRoute[simStep].lat,
    simulatedRoute[simStep].lng,
  ];

  const routePolyline = simulatedRoute.map((p) => [p.lat, p.lng]);

  return (
    <div className="relative w-full h-[550px] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
      
      {/* Simulation Control Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-2">
        <div className="flex items-center gap-2 px-2 border-r border-slate-200 text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Simulation Mode</span>
        </div>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isSimulating
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-[#519755] text-white hover:bg-[#3C733F]'
          }`}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'Pause Route' : 'Resume Route'}</span>
        </button>
        <button
          onClick={() => setSimStep(0)}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
          title="Reset route"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Status Box */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-800 max-w-xs">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-wildflower-mint uppercase tracking-wider">Live Fleet Telemetry</span>
          <span className="bg-[#519755] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>
        </div>
        <p className="font-extrabold text-sm text-white">Bio-Carrier TS-09-UB-4501</p>
        <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-wildflower-rose shrink-0" />
          <span className="truncate">Near: {simulatedRoute[simStep].name}</span>
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Speed: 38 km/h</span>
          <span>Load: 185 / 800 kg</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={centerPos}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={centerPos} zoom={zoomLevel} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Simulated Route Polyline */}
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: '#519755',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8',
          }}
        />

        {/* Hospital Markers */}
        {hospitals.map((h) => {
          const lat = parseFloat(h.latitude) || 17.385;
          const lng = parseFloat(h.longitude) || 78.4867;
          return (
            <Marker
              key={h._id || h.hospitalId}
              position={[lat, lng]}
              icon={createHospitalIcon(h.ownership)}
            >
              <Popup>
                <div className="p-1 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#519755]" />
                    <span>{h.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-1">{h.address}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold mt-2 pt-1 border-t border-slate-200">
                    <span className="text-[#3C733F]">{h.district} • {h.type}</span>
                    <span className="text-slate-500">{h.phone}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Moving Simulated Vehicle Marker */}
        <Marker
          position={currentVehiclePos}
          icon={createVehicleIcon('Collecting')}
        >
          <Popup>
            <div className="p-1 max-w-xs text-slate-800">
              <h4 className="font-extrabold text-xs text-slate-900 mb-1">
                Bio-Carrier TS-09-UB-4501
              </h4>
              <p className="text-[11px] text-slate-600">
                Driver: <strong>Kiran Kumar</strong> (+91 98480 22338)
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-semibold">
                Route Destination: Gandhi Hospital Disposal Yard
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LiveVehicleMap;
