/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
