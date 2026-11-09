/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#09090B',
          panel: '#111115',
          panelAlt: '#16161C',
          subtle: '#1C1C24',
          border: 'rgba(255, 255, 255, 0.07)',
          borderHover: 'rgba(255, 255, 255, 0.14)',
          text: '#EDEDEF',
          muted: '#8F909D',
          dim: '#52525E',
        },
        brand: {
          indigo: {
            DEFAULT: '#4F46E5',
            light: '#6366F1',
            hover: '#4338CA',
            glow: 'rgba(99, 102, 241, 0.35)',
          },
          purple: {
            DEFAULT: '#9D4EDD',
            light: '#C77DFF',
            glow: 'rgba(157, 78, 221, 0.35)',
          },
          cyan: {
            DEFAULT: '#22D3EE',
            light: '#67E8F9',
            glow: 'rgba(34, 211, 238, 0.3)',
          },
          emerald: {
            DEFAULT: '#58DB91',
            light: '#88E788',
            glow: 'rgba(88, 219, 145, 0.3)',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'technical-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'technical-glow': '0 0 20px -2px rgba(99, 102, 241, 0.35)',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
