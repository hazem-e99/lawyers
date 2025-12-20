/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ألوان النظام الأساسية - استخدام المتغيرات
        // Primary system colors - using CSS variables
        theme: {
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          'primary-light': 'var(--color-primary-light)',
          secondary: 'var(--color-secondary)',
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-hover': 'var(--color-surface-hover)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          'text-light': 'var(--color-text-light)',
          border: 'var(--color-border)',
          'border-light': 'var(--color-border-light)',
          success: 'var(--color-success)',
          'success-light': 'var(--color-success-light)',
          warning: 'var(--color-warning)',
          'warning-light': 'var(--color-warning-light)',
          danger: 'var(--color-danger)',
          'danger-light': 'var(--color-danger-light)',
          info: 'var(--color-info)',
          'info-light': 'var(--color-info-light)',
        },
        
        // الألوان القديمة للتوافق - Old colors for compatibility
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fc',
          400: '#8193f8',
          500: '#1e40af', // اللون الأساسي
          600: '#1e3a8a',
          700: '#1e3a8a',
          800: '#1e2e6e',
          900: '#1e2756',
        },
        // ألوان ذهبية للمحاماة
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c8a415',
          600: '#a16207',
          700: '#854d0e',
          800: '#713f12',
          900: '#5c3310',
        },
        // ألوان داكنة
        dark: {
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
        },
      },
      fontFamily: {
        almarai: ['Almarai', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elegant': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
