import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Standard political colors
        'dem': {
          safe: '#1a4480',
          likely: '#2e6db4',
          lean: '#5c9cd8',
          tilt: '#a6cee3',
        },
        'rep': {
          safe: '#8b0000',
          likely: '#c41e3a',
          lean: '#e65c5c',
          tilt: '#f4a6a6',
        },
        'battleground': {
          DEFAULT: '#7b2d8e',
          light: '#9b4daa',
        },
        // Colorblind-friendly alternatives
        'cb-dem': {
          safe: '#0072B2',
          likely: '#56B4E9',
          lean: '#88CCEE',
          tilt: '#BBDDFF',
        },
        'cb-rep': {
          safe: '#D55E00',
          likely: '#E69F00',
          lean: '#F0C566',
          tilt: '#FFDD99',
        },
        'cb-battleground': {
          DEFAULT: '#CC79A7',
          light: '#DDAACC',
        },
        // UI colors
        'surface': {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
