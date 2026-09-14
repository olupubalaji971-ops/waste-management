import React, { useState } from 'react';

/**
 * SpotlightCard - Inspired by React Bits (https://reactbits.dev)
 * Mouse-aware spotlight card with dynamic cursor-following radial light and glowing borders.
 */
const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(81, 151, 85, 0.18)',
  borderColor = 'rgba(81, 151, 85, 0.4)',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`spotlight-card relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-300 shadow-sm hover:shadow-xl hover:border-emerald-400/60 dark:hover:border-emerald-500/60 ${className}`}
      style={{
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* Spotlight highlight layer */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 -z-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SpotlightCard;
