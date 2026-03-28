/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        arabic:  ['IBMPlexArabic', 'IBM Plex Sans Arabic', 'sans-serif'],
        latin:   ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary:  { DEFAULT: '#059669', hover: '#047857', light: '#d1fae5' }, // Emerald
        accent:   { DEFAULT: '#d97706', hover: '#b45309', light: '#fef3c7' }, // Amber
        success:  { DEFAULT: '#10b981', bg: '#ecfdf5' },
        danger:   { DEFAULT: '#ef4444', bg: '#fef2f2' },
        warning:  { DEFAULT: '#f59e0b', bg: '#fffbeb' },
        info:     { DEFAULT: '#3b82f6', bg: '#eff6ff' },
        sidebar:  '#09090b',
        page:     '#f8fafc',
        surface:  '#ffffff',
        'surface-2': '#f1f5f9',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.05)',
        md: '0 4px 14px rgba(0,0,0,0.06)',
        lg: '0 10px 30px rgba(0,0,0,0.08)',
        green:   '0 4px 20px rgba(5, 150, 105, 0.25)',
        success: '0 4px 20px rgba(16, 185, 129, 0.25)',
        danger:  '0 4px 20px rgba(239, 68, 68, 0.25)',
        glow:    '0 0 15px rgba(5, 150, 105, 0.3)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'count-up': 'countUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      borderRadius: {
        'lg': '0.75rem',  // 12px
        'xl': '1rem',     // 16px
        '2xl': '1.5rem',  // 24px
      }
    },
  },
  plugins: [],
}
