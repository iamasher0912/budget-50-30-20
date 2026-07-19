/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c8',
          400: '#828ea6',
          500: '#636e89',
          600: '#4e5870',
          700: '#40485b',
          800: '#373d4d',
          900: '#1f2330',
          950: '#13161f',
        },
        brand: {
          50: '#eefcf6',
          100: '#d6f7e8',
          200: '#aeefd4',
          300: '#7ce3bc',
          400: '#43ce9b',
          500: '#1fb383',
          600: '#0f9069',
          700: '#0c7355',
          800: '#0b5b45',
          900: '#094a39',
        },
        needs: { DEFAULT: '#3b82f6', soft: '#dbeafe' },
        wants: { DEFAULT: '#f59e0b', soft: '#fef3c7' },
        savings: { DEFAULT: '#10b981', soft: '#d1fae5' },
        danger: { DEFAULT: '#ef4444', soft: '#fee2e2' },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        'card-lg': '0 10px 30px -12px rgba(16,24,40,0.18), 0 2px 6px rgba(16,24,40,0.06)',
        glow: '0 0 0 1px rgba(31,179,131,0.18), 0 8px 24px -8px rgba(31,179,131,0.25)',
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'slide-up': 'slide-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
