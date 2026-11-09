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
        background: '#09090B',
        foreground: '#EDEDEF',
        card: {
          DEFAULT: '#0D0D10',
          foreground: '#EDEDEF',
        },
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#6366F1',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#9D4EDD',
          hover: '#C77DFF',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#58DB91',
          hover: '#88E788',
          accent: '#95CC52',
          foreground: '#09090B',
        },
        accent: {
          cyan: '#22D3EE',
          purple: '#C77DFF',
        },
        studio: {
          bg: '#09090B',
          panel: '#0D0D10',
          panelAlt: '#121217',
          subtle: '#18181E',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          text: '#EDEDEF',
          muted: '#8F909D',
          dim: '#52525E',
        },
        brand: {
          indigo: {
            DEFAULT: '#4F46E5',
            light: '#6366F1',
            hover: '#4338CA',
            glow: 'rgba(99, 102, 241, 0.25)',
          },
          purple: {
            DEFAULT: '#9D4EDD',
            light: '#C77DFF',
            glow: 'rgba(157, 78, 221, 0.25)',
          },
          cyan: {
            DEFAULT: '#22D3EE',
            light: '#67E8F9',
            glow: 'rgba(34, 211, 238, 0.25)',
          },
          emerald: {
            DEFAULT: '#58DB91',
            light: '#88E788',
            glow: 'rgba(88, 219, 145, 0.25)',
          },
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
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
      borderRadius: {
        lg: '0.625rem', // 10px - match QRCraft standard
        md: 'calc(0.625rem - 2px)',
        sm: 'calc(0.625rem - 4px)',
      },
      boxShadow: {
        'technical-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'technical-glow': '0 0 20px -2px rgba(99, 102, 241, 0.25)',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
