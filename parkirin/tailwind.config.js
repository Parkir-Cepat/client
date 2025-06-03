/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#f16634', // Our main brand color
          700: '#e05526',
          800: '#c2410c',
          900: '#9a3412',
          950: '#431407',
        },
        orange: {
          DEFAULT: '#f16634',
          light: '#ff8c5a',
          dark: '#d45528',
          50: '#fff7f0',
          100: '#ffeee2',
          200: '#ffd9c3',
          300: '#ffbd9a',
          400: '#ff9e71',
          500: '#f16634',
          600: '#e05526',
          700: '#c43c1b',
          800: '#a23118',
          900: '#842b18',
          950: '#471105',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 10px 20px rgba(0, 0, 0, 0.12)',
        'orange': '0 4px 14px rgba(241, 102, 52, 0.25)',
        'orange-lg': '0 8px 24px rgba(241, 102, 52, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}