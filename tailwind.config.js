/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6fff9',
          100: '#b3ffee',
          200: '#66ffdd',
          300: '#00ffcc',
          400: '#00e6b8',
          500: '#00c9a0',
          600: '#00a882',
          700: '#008066',
          800: '#005a47',
          900: '#003329',
        },
        dark: {
          50: '#f0f0f5',
          100: '#d0d0e0',
          200: '#a0a0c0',
          300: '#7070a0',
          400: '#404060',
          500: '#1a1a2e',
          600: '#141428',
          700: '#0e0e1e',
          800: '#0a0a15',
          900: '#050508',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card: '#161625',
          elevated: '#1e1e30',
          border: '#2a2a40',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0a15 0%, #0f1a2e 50%, #0a0a15 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0,201,160,0.05) 0%, rgba(0,201,160,0) 100%)',
        'brand-gradient': 'linear-gradient(135deg, #00c9a0 0%, #0088cc 100%)',
        'fire-gradient': 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      },
      boxShadow: {
        'brand': '0 0 30px rgba(0,201,160,0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow': '0 0 60px rgba(0,201,160,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 0.5s ease-out forwards',
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
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
