/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace']
      },
      colors: {
        background: '#05070c',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-amber': 'var(--accent-amber)',
        'accent-red': 'var(--accent-red)'
      },
      boxShadow: {
        glow: '0 0 12px rgba(85, 230, 165, 0.25)'
      }
    }
  },
  plugins: []
};
