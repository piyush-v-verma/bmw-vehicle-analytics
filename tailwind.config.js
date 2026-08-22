/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bmw: {
          app: '#1e1e2e',
          sidebar: '#11111b',
          panel: '#181825',
          card: '#252538',
          hover: '#313244',
          border: '#313244',
          main: '#cdd6f4',
          muted: '#a6adc8',
          accent: '#b4befe',
          accentHover: '#cba6f7',
          teal: '#94e2d5',
          success: '#a6e3a1',
          warning: '#f9e2af',
          error: '#f38ba8',
          info: '#89b4fa',
          blue: '#1c69d4', // Official BMW M Blue
          mBlue: '#0066b1',
          mViolet: '#2a2d7c',
          mRed: '#e10600'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(180, 190, 254, 0.25)',
        'glow-teal': '0 0 20px rgba(148, 226, 213, 0.25)',
        'glow-card': '0 8px 32px rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
