/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nsi: {
          bg: '#0a0f1e',
          card: '#0d1526',
          border: '#1a2332',
          cyan: '#00d4ff',
          amber: '#ffb800',
          coral: '#ff4d6d',
          green: '#00e5a0',
          text: '#e8f0fe',
          muted: '#7b8fa6',
          grid: '#111a2e',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'counter': 'counter 0.3s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 4px currentColor', opacity: '1' },
          '50%': { boxShadow: '0 0 12px currentColor', opacity: '0.7' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #111a2e 1px, transparent 1px), linear-gradient(to bottom, #111a2e 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
