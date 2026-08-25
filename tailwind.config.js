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
        molten: {
          base: '#0D0B0A',
          alt: '#171310',
          amber: '#FF9A3D',
          orange: '#FF5722',
          yellow: '#FFC107',
          'glass-fill': 'rgba(255, 255, 255, 0.045)',
          'glass-hover': 'rgba(255, 255, 255, 0.07)',
          'glass-border': 'rgba(255, 255, 255, 0.09)',
        },
        cooling: {
          frontend: '#FFE9A8',
          backend: '#FF9A3D',
          databases: '#FF5722',
          tools: '#C43A1F',
        },
        text: {
          primary: '#F5F1EC',
          muted: '#9A9088',
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'molten-gradient': 'linear-gradient(120deg, #FFC107, #FF5722)',
        'molten-[#FFC107]-to-[#FF5722]': 'linear-gradient(120deg, #FFC107, #FF5722)',
      },
      boxShadow: {
        glass: '0 20px 50px -20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'molten-glow': '0 0 30px rgba(255, 154, 61, 0.25)',
        'orange-glow': '0 0 30px rgba(255, 87, 34, 0.3)',
      },
      animation: {
        'ember-float-1': 'emberDrift1 18s ease-in-out infinite',
        'ember-float-2': 'emberDrift2 22s ease-in-out infinite',
        'ember-float-3': 'emberDrift3 25s ease-in-out infinite',
      },
      keyframes: {
        emberDrift1: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(60px, -40px) scale(1.15)' },
        },
        emberDrift2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-50px, 50px) scale(1.1)' },
        },
        emberDrift3: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(40px, 60px) scale(1.08)' },
        },
      }
    },
  },
  plugins: [],
}
