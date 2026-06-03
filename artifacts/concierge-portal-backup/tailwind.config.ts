import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          800: '#0f1f3d',
          900: '#0a1628',
          950: '#060f1e',
        },
        surface: {
          DEFAULT: '#f8faff',
          card:    '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,31,61,0.08), 0 1px 2px -1px rgba(15,31,61,0.06)',
        'card-hover': '0 4px 6px -1px rgba(15,31,61,0.12), 0 2px 4px -2px rgba(15,31,61,0.08)',
        sidebar: '4px 0 24px rgba(15,31,61,0.15)',
      },
    },
  },
  plugins: [],
}
export default config
