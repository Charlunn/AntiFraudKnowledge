const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './src/**/*.{js,ts,vue}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'Noto Sans', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        'primary-50': colors.indigo[50],
        'primary-100': colors.indigo[100],
        'primary-200': colors.indigo[200],
        'primary-300': colors.indigo[300],
        'primary-400': colors.indigo[400],
        'primary-500': colors.indigo[500],
        'primary-600': colors.indigo[600],
        'primary-700': colors.indigo[700],
        'primary-800': colors.indigo[800],
        'primary-900': colors.indigo[900],
        'neutral-50': colors.slate[50],
        'neutral-100': colors.slate[100],
        'neutral-200': colors.slate[200],
        'neutral-300': colors.slate[300],
        'neutral-400': colors.slate[400],
        'neutral-500': colors.slate[500],
        'neutral-600': colors.slate[600],
        'neutral-700': colors.slate[700],
        'neutral-800': colors.slate[800],
        'neutral-900': colors.slate[900],
        'success-50': colors.emerald[50],
        'success-100': colors.emerald[100],
        'success-200': colors.emerald[200],
        'success-300': colors.emerald[300],
        'success-400': colors.emerald[400],
        'success-500': colors.emerald[500],
        'success-600': colors.emerald[600],
        'success-700': colors.emerald[700],
        'success-800': colors.emerald[800],
        'success-900': colors.emerald[900],
        'error-50': colors.rose[50],
        'error-100': colors.rose[100],
        'error-200': colors.rose[200],
        'error-300': colors.rose[300],
        'error-400': colors.rose[400],
        'error-500': colors.rose[500],
        'error-600': colors.rose[600],
        'error-700': colors.rose[700],
        'error-800': colors.rose[800],
        'error-900': colors.rose[900],
        'warning-50': colors.amber[50],
        'warning-100': colors.amber[100],
        'warning-200': colors.amber[200],
        'warning-300': colors.amber[300],
        'warning-400': colors.amber[400],
        'warning-500': colors.amber[500],
        'warning-600': colors.amber[600],
        'warning-700': colors.amber[700],
        'warning-800': colors.amber[800],
        'warning-900': colors.amber[900],
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-border': '#1f2937',
        'dark-text': '#f1f5f9',
        'dark-text-secondary': '#94a3b8'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ]
}
