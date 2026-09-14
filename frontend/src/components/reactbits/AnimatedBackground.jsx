import React from 'react';
import Lightfall from './Lightfall';

/**
 * AnimatedBackground - React Bits Lightfall integration
 * Renders the electric blue cosmic lightfall with falling light streaks and pointer reaction.
 */
const AnimatedBackground = ({ children, className = '' }) => {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      {/* React Bits Lightfall Component - Layer 0 directly beneath content */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ width: '100%', height: '100%', minHeight: '600px' }}
      >
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={0.5}
          mouseRadius={1}
          color1="#A6C8FF"
          color2="#5227FF"
          color3="#FF9FFC"
        />
      </div>

      {/* Subtle vignette gradient to maximize contrast for typography and buttons */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none z-[1]" />

      {/* Main Content on Layer 10 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
