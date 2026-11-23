import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base palette
        bg: {
          DEFAULT: '#0a0f1e',
          secondary: '#111827',
          tertiary: '#162033',
        },
        card: {
          DEFAULT: '#162033',
          secondary: '#1e2a44',
        },
        border: '#2a3a5e',
        text: {
          DEFAULT: '#e8eef7',
          muted: '#94a3b8',
        },
        // Domain accent colours
        audio: {
          DEFAULT: '#06b6d4',    // Cyan
          light: '#22d3ee',
          dark: '#0891b2',
          bg: '#0e3d4a',
        },
        image: {
          DEFAULT: '#a855f7',    // Purple/Violet
          light: '#c084fc',
          dark: '#9333ea',
          bg: '#3b1d5c',
        },
        video: {
          DEFAULT: '#f59e0b',    // Amber/Orange
          light: '#fbbf24',
          dark: '#d97706',
          bg: '#5c2d0a',
        },
        network: {
          DEFAULT: '#10b981',    // Emerald/Green
          light: '#34d399',
          dark: '#059669',
          bg: '#064e3b',
        },
        // Status colours
        ok: '#22c55e',
        warn: '#fbbf24',
        err: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['1.5rem', { lineHeight: '1.3' }],
        'h3': ['1.25rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 6px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.5)',
        'inner-glow': 'inset 0 0 0 1px rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'buffer-fill': 'bufferFill 1s ease-out forwards',
        'waveform': 'waveform 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        bufferFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config