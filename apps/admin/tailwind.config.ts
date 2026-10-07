import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#16265C',
          950: '#0B1636',
          900: '#0F1E4D',
          800: '#122356',
          700: '#16265C',
          600: '#22357A',
          500: '#3A4C87',
          400: '#6B77A0',
          300: '#A6AEC6',
          200: '#CDD3E1',
          100: '#E7EAF2',
          50: '#F4F6FB',
        },
        teal: {
          DEFAULT: '#1BC0C5',
          700: '#0E9BA0',
          600: '#14AEB3',
          500: '#1BC0C5',
          400: '#45D0D4',
          300: '#84E2E5',
          200: '#B6EEF0',
          100: '#DBF7F8',
          50: '#EFFCFC',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
