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
        navy: {
          950: '#070f1e',
          900: '#0b192c',
          850: '#0f223d',
          800: '#142d4f',
          700: '#1c3d69',
          600: '#25508a',
          500: '#3267b0',
        },
        maritime: {
          blue: '#1e3a8a',
          teal: '#0ea5e9',
          cyan: '#06b6d4',
          gold: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
