import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sora)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#effcfa',
          100: '#c6f6ee',
          200: '#8feadd',
          300: '#5bd8c9',
          400: '#2fc0b0',
          500: '#17a394',
          600: '#0f8377',
          700: '#0f6960',
          800: '#11544e',
          900: '#124743',
          950: '#04292a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
