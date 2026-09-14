import React from 'react';

/**
 * ShinyButton - Inspired by React Bits (https://reactbits.dev)
 * Interactive button with dynamic light sweep shimmer, hover elevation, and tactile click response.
 */
const ShinyButton = ({
  children,
  onClick,
  variant = 'emerald', // 'emerald', 'amber', 'slate', 'outline', 'purple'
  className = '',
  icon: Icon = null,
  disabled = false,
  type = 'button',
  size = 'md', // 'sm', 'md', 'lg'
}) => {
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-3 text-xs sm:text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5',
  };

  const variantClasses = {
    emerald:
      'bg-gradient-to-r from-[#519755] via-[#458548] to-[#3C733F] text-white shadow-lg shadow-[#519755]/30 hover:shadow-[#519755]/50 border border-emerald-400/40',
    amber:
      'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 border border-amber-300/40',
    slate:
      'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white shadow-lg shadow-slate-900/30 hover:shadow-slate-900/50 border border-slate-700/60',
    purple:
      'bg-gradient-to-r from-[#BE91BE] via-[#a36ea3] to-[#864e86] text-white shadow-lg shadow-[#BE91BE]/30 hover:shadow-[#BE91BE]/50 border border-purple-300/40',
    outline:
      'bg-white/90 hover:bg-white text-slate-800 border-2 border-slate-200/90 shadow-sm hover:border-[#519755] hover:text-[#519755] dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700 dark:hover:border-emerald-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center font-black tracking-wide cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shiny-button-effect ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.emerald} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  );
};

export default ShinyButton;
