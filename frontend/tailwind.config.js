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
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
        },
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          light: 'rgb(var(--color-background-light) / <alpha-value>)',
        },
        text: {
          dark: 'rgb(var(--color-text-dark) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          gray: 'rgb(var(--color-text-gray) / <alpha-value>)',
          light: 'rgb(var(--color-text-light) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          light: 'rgb(var(--color-border-light) / <alpha-value>)',
        },
        success: {
          light: 'rgb(var(--color-success-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          dark: 'rgb(var(--color-success-dark) / <alpha-value>)',
        },
        danger: {
          light: 'rgb(var(--color-danger-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          dark: 'rgb(var(--color-danger-dark) / <alpha-value>)',
        },
        warning: {
          light: 'rgb(var(--color-warning-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          dark: 'rgb(var(--color-warning-dark) / <alpha-value>)',
        },
        info: {
          light: 'rgb(var(--color-info-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          dark: 'rgb(var(--color-info-dark) / <alpha-value>)',
        },
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'DEFAULT': '8px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in',
        'fadeOut': 'fadeOut 0.3s ease-out',
        'slideUp': 'slideUp 0.5s ease',
        'slideDown': 'slideDown 0.3s ease',
        'slideIn': 'slideIn 0.3s ease',
        'slideOut': 'slideOut 0.3s ease',
        'scaleIn': 'scaleIn 0.2s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
