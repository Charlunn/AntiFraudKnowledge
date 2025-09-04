/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 基于UI设计规范的颜色系统
      colors: {
        // 主色调 - 蓝色系
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1193d4', // 主要蓝色
          600: '#0f7bb8',
          700: '#0d5a8a',
          800: '#0c4a6e',
          900: '#0c3d5c'
        },
        // 中性色 - 灰色系
        neutral: {
          50: '#f8f9fa',
          100: '#e7eff3',
          200: '#cfdfe7',
          300: '#92b7c9',
          400: '#4c809a',
          500: '#0d171b',
          600: '#0a1317',
          700: '#080f12',
          800: '#060b0e',
          900: '#04080a'
        },
        // 成功色 - 绿色
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4caf50', // 主要绿色
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        // 错误色 - 红色
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#f44336', // 主要红色
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        // 警告色 - 黄色
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ffc107', // 主要黄色
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        // 深色模式颜色
        dark: {
          bg: '#111c22',
          surface: '#192b33',
          border: '#233c48',
          text: '#ffffff',
          'text-secondary': '#92b7c9'
        }
      },
      // 字体系统
      fontFamily: {
        'sans': ['Public Sans', 'Noto Sans', 'system-ui', 'sans-serif'],
        'display': ['Public Sans', 'system-ui', 'sans-serif']
      },
      // 字体大小
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      // 间距系统
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      // 阴影系统
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'modal': '0 10px 25px rgba(0, 0, 0, 0.2)',
        'focus': '0 0 0 3px rgba(17, 147, 212, 0.1)'
      },
      // 边框圆角
      borderRadius: {
        'card': '8px',
        'button': '6px',
        'input': '4px'
      },
      // 动画
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      // 断点系统
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // 自定义插件：组件类
    function({ addComponents, theme }) {
      addComponents({
        // 按钮组件
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.sm[0]'),
          fontWeight: theme('fontWeight.medium'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
          borderRadius: theme('borderRadius.button'),
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          '&:focus': {
            outline: 'none',
            boxShadow: theme('boxShadow.focus')
          },
          '&:disabled': {
            opacity: '0.6',
            cursor: 'not-allowed',
            pointerEvents: 'none'
          }
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.card-hover')
          }
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.neutral.100'),
          color: theme('colors.neutral.500'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.neutral.200'),
            transform: 'translateY(-1px)'
          }
        },
        '.btn-success': {
          backgroundColor: theme('colors.success.500'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.success.600'),
            transform: 'translateY(-1px)'
          }
        },
        '.btn-error': {
          backgroundColor: theme('colors.error.500'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.error.600'),
            transform: 'translateY(-1px)'
          }
        },
        '.btn-outline': {
          backgroundColor: 'transparent',
          border: `1px solid ${theme('colors.primary.500')}`,
          color: theme('colors.primary.500'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.500'),
            color: theme('colors.white')
          }
        },
        // 卡片组件
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.card'),
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme('boxShadow.card-hover')
          }
        },
        '.card-dark': {
          backgroundColor: theme('colors.dark.surface'),
          border: `1px solid ${theme('colors.dark.border')}`
        },
        // 输入框组件
        '.input': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.base[0]'),
          lineHeight: theme('fontSize.base[1].lineHeight'),
          color: theme('colors.neutral.500'),
          backgroundColor: theme('colors.white'),
          border: `1px solid ${theme('colors.neutral.200')}`,
          borderRadius: theme('borderRadius.input'),
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: theme('boxShadow.focus')
          },
          '&:disabled': {
            backgroundColor: theme('colors.neutral.50'),
            opacity: '1'
          }
        },
        '.input-dark': {
          backgroundColor: theme('colors.dark.surface'),
          borderColor: theme('colors.dark.border'),
          color: theme('colors.dark.text'),
          '&::placeholder': {
            color: theme('colors.dark.text-secondary')
          }
        }
      })
    }
  ]
}