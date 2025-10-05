/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-mode="mono"]'],
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-heading)'],
        mono: ['var(--font-mono)']
      },
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        stroke: 'var(--stroke)',
        grid: 'var(--grid)',
        amber: 'var(--amber)',
        red: 'var(--red)',
        cyan: 'var(--cyan)',
        white: 'var(--white)',
        mid: 'var(--mid)',
        dim: 'var(--dim)'
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '5px',
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
        '3xl': '14px',
        hud: '18px'
      },
      boxShadow: {
        hud: '0 0 0 1px rgba(0, 179, 255, 0.25), 0 0 32px rgba(85, 230, 165, 0.25)',
        panel: '0 18px 46px rgba(0, 0, 0, 0.35)'
      },
      animation: {
        'dash-slow': 'dash 12s linear infinite',
        'glow-pulse': 'glow 3s ease-in-out infinite',
        'parallax-float': 'float 10s ease-in-out infinite'
      },
      keyframes: {
        dash: {
          '0%': { strokeDashoffset: 16 },
          '100%': { strokeDashoffset: 0 }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0, 179, 255, 0.2)' },
          '50%': { boxShadow: '0 0 18px rgba(85, 230, 165, 0.4)' }
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -6px, 0)' }
        }
      }
    }
  },
  plugins: []
};
