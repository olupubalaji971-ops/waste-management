/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wildflower: {
          mint: '#A8DCAB',
          green: '#519755',
          darkgreen: '#3C733F',
          rose: '#DBAAA7',
          lavender: '#BE91BE',
          softbg: '#F6FAF6',
        },
        bmw: {
          yellow: '#EAB308',
          yellowbg: '#FEF9C3',
          red: '#EF4444',
          redbg: '#FEE2E2',
          white: '#64748B',
          whitebg: '#F1F5F9',
          blue: '#3B82F6',
          bluebg: '#DBEAFE',
          general: '#10B981',
          generalbg: '#D1FAE5',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'shimmer-slow': 'shimmer 4s infinite linear',
        'spin-slow': 'spin 12s linear infinite',
        'border-glow': 'borderGlow 3s ease infinite',
        'beacon': 'beaconPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(81, 151, 85, 0.3)' },
          '50%': { borderColor: 'rgba(168, 220, 171, 0.8)' },
        },
        beaconPulse: {
          '0%': { transform: 'scale(0.95)', opacity: '0.9' },
          '50%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(81, 151, 85, 0.45)',
        'glow-mint': '0 0 20px -3px rgba(168, 220, 171, 0.5)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(190, 145, 190, 0.4)',
      },
    },
  },
  plugins: [],
};
