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
        gold: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fde7a6',
          300: '#fbd46e',
          400: '#f7be38',
          500: '#d4af37', // Metallic Classic Gold
          600: '#b89228',
          700: '#947020',
          800: '#7a5a20',
          900: '#674a20',
          950: '#3c280d',
        },
        obsidian: {
          50: '#23201d',
          100: '#1b1916',
          200: '#161412',
          300: '#13110f',
          400: '#100e0d',
          500: '#0d0c0a',
          600: '#0a0908',
          700: '#070605',
          800: '#050404',
          900: '#020202',
        },
        // Universal Semantic Tokens connected to CSS variables
        'surface': 'var(--color-surface)',
        'surface-dim': 'var(--color-surface-dim)',
        'surface-bright': 'var(--color-surface-bright)',
        'surface-container-lowest': 'var(--color-surface-lowest)',
        'surface-container-low': 'var(--color-surface-low)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-high': 'var(--color-surface-high)',
        'surface-container-highest': 'var(--color-surface-highest)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'inverse-surface': 'var(--color-inverse-surface)',
        'inverse-on-surface': 'var(--color-inverse-on-surface)',
        'outline': 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',
        'primary': 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary-container': 'var(--color-on-primary-container)',
        'secondary': 'var(--color-secondary)',
        'on-secondary': 'var(--color-on-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary-container': 'var(--color-on-secondary-container)',
        'error': '#f87171',
        'on-error': '#450a0a',
        'error-container': '#450a0a',
        'on-error-container': '#fecaca',
        'background': 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', '"Plus Jakarta Sans"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'gold-glow-lg': '0 0 45px -8px rgba(212, 175, 55, 0.45)',
        'obsidian-card': '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(212, 175, 55, 0.15)',
        'obsidian-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
      },
      backgroundImage: {
        'gold-metallic': 'linear-gradient(135deg, #f7d070 0%, #d4af37 50%, #9e7a1b 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #d4af37 0%, #fff2b2 50%, #d4af37 100%)',
        'gold-radial': 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.22) 0%, rgba(13, 12, 10, 0) 70%)',
        'dark-card': 'linear-gradient(180deg, rgba(26, 23, 20, 0.85) 0%, rgba(15, 13, 11, 0.95) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
