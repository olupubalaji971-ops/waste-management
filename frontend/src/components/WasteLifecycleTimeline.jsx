import React from 'react';
import {
  CheckCircle2,
  Clock,
  QrCode,
  Truck,
  UserCheck,
  PackageCheck,
  Building,
  Factory,
  ShieldCheck,
} from 'lucide-react';

const WasteLifecycleTimeline = ({ currentStatus = 'GENERATED', timelineHistory = [] }) => {
  const steps = [
    {
      id: 'GENERATED',
      title: '1. Waste Logged',
      desc: 'Hospital staff enters clinical waste data into system',
      icon: Building,
      statusMatch: ['GENERATED', 'REQUESTED', 'ASSIGNED', 'DISPATCHED', 'ARRIVED', 'COLLECTED', 'IN_TRANSIT', 'PROCESSED'],
    },
    {
      id: 'QR_TAGGED',
      title: '2. QR Code Tagged',
      desc: 'Unique BMW tracking code generated and affixed to container',
      icon: QrCode,
      statusMatch: ['GENERATED', 'REQUESTED', 'ASSIGNED', 'DISPATCHED', 'ARRIVED', 'COLLECTED', 'IN_TRANSIT', 'PROCESSED'],
    },
    {
      id: 'REQUESTED',
      title: '3. Pickup Requested',
      desc: 'Hospital initiates collection request with priority level',
      icon: Clock,
      statusMatch: ['REQUESTED', 'ASSIGNED', 'DISPATCHED', 'ARRIVED', 'COLLECTED', 'IN_TRANSIT', 'PROCESSED', 'Pending', 'Assigned', 'Dispatched', 'Arrived', 'Collected', 'Completed'],
    },
    {
      id: 'ASSIGNED',
      title: '4. Vehicle Assigned',
      desc: 'State admin dispatches bio-carrier vehicle and operator',
      icon: UserCheck,
      statusMatch: ['ASSIGNED', 'DISPATCHED', 'ARRIVED', 'COLLECTED', 'IN_TRANSIT', 'PROCESSED', 'Assigned', 'Dispatched', 'Arrived', 'Collected', 'Completed'],
    },
    {
      id: 'DISPATCHED',
      title: '5. Fleet En Route',
      desc: 'Driver navigates with live GPS telemetry tracking',
      icon: Truck,
      statusMatch: ['DISPATCHED', 'ARRIVED', 'COLLECTED', 'IN_TRANSIT', 'PROCESSED', 'Dispatched', 'Arrived', 'Collected', 'Completed'],
    },
    {
      id: 'ARRIVED',
      title: '6. Vehicle Arrived',
      desc: 'Carrier reaches hospital waste disposal yard',
      icon: PackageCheck,
      statusMatch: ['ARRIVED', 'COLLECTED', 'IN_TRANSIT', 'PROCESSED', 'Arrived', 'Collected', 'Completed'],
    },
    {
      id: 'COLLECTED',
      title: '7. Waste Collected',
      desc: 'QR verification scan, weight audit, and secure loading',
      icon: ShieldCheck,
      statusMatch: ['COLLECTED', 'IN_TRANSIT', 'PROCESSED', 'Collected', 'Completed'],
    },
    {
      id: 'PROCESSED',
      title: '8. Facility Processed',
      desc: 'Autoclaving, shredding, or high-temp incineration completed',
      icon: Factory,
      statusMatch: ['PROCESSED', 'Completed'],
    },
  ];

  const isStepComplete = (step) => {
    return step.statusMatch.includes(currentStatus);
  };

  const isStepActive = (step, idx) => {
    const nextStep = steps[idx + 1];
    return isStepComplete(step) && (!nextStep || !isStepComplete(nextStep));
  };

  return (
    <div className="py-6 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#519755] animate-ping"></span>
            End-to-End Biomedical Waste Lifecycle
          </h3>
          <p className="text-xs text-slate-400">Complete regulatory chain of custody & GPS audit flow</p>
        </div>
        <span className="bg-[#A8DCAB]/40 text-[#3C733F] text-xs font-extrabold px-3 py-1 rounded-full border border-[#519755]/30">
          Status: {currentStatus}
        </span>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const completed = isStepComplete(step);
          const active = isStepActive(step, idx);

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all relative ${
                active
                  ? 'bg-[#F6FAF6] border-[#519755] shadow-md shadow-[#519755]/15 ring-2 ring-[#A8DCAB]'
                  : completed
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                  : 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    completed
                      ? 'bg-[#519755] text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#519755]" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
                )}
              </div>

              <h4 className="font-extrabold text-xs text-slate-900 mb-1">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WasteLifecycleTimeline;
