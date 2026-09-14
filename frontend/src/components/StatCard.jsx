import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  unit = '',
  change = null,
  isPositive = true,
  icon: Icon,
  colorScheme = 'green', // 'green', 'mint', 'rose', 'lavender', 'amber', 'blue'
  subtitle = '',
}) => {
  const schemeClasses = {
    green: {
      bg: 'bg-emerald-50/70 border-emerald-200/70',
      iconBg: 'bg-[#519755] text-white',
      text: 'text-[#3C733F]',
    },
    mint: {
      bg: 'bg-[#A8DCAB]/15 border-[#A8DCAB]/60',
      iconBg: 'bg-[#519755] text-white',
      text: 'text-slate-800',
    },
    rose: {
      bg: 'bg-[#DBAAA7]/15 border-[#DBAAA7]/60',
      iconBg: 'bg-[#c28480] text-white',
      text: 'text-slate-900',
    },
    lavender: {
      bg: 'bg-[#BE91BE]/15 border-[#BE91BE]/60',
      iconBg: 'bg-[#9f6d9f] text-white',
      text: 'text-slate-900',
    },
    amber: {
      bg: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      text: 'text-amber-900',
    },
    blue: {
      bg: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      text: 'text-blue-900',
    },
  };

  const scheme = schemeClasses[colorScheme] || schemeClasses.green;

  return (
    <div className={`p-5 rounded-2xl border ${scheme.bg} shadow-2xs hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
            {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${scheme.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs pt-2 border-t border-black/5">
        {change ? (
          <div className="flex items-center gap-1 font-semibold">
            {isPositive ? (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {change}
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            <span className="text-slate-400 font-normal">vs last week</span>
          </div>
        ) : (
          <span className="text-slate-500">{subtitle || 'Active in grid'}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
