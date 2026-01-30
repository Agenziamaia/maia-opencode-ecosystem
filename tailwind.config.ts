import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        'maia-black': '#0a0a0a',
        'maia-cyan': '#00ffff',
        'maia-green': '#00ff66',
        'maia-amber': '#ff9500',
        'maia-red': '#ff3366',
        'maia-gray': '#1a1a1a',
      },
      animation: {
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': {
            transform: 'translateY(-100%)',
          },
          '100%': {
            transform: 'translateY(100vh)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
