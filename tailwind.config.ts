import { theme } from './src/theme/theme';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: {
          DEFAULT: theme.colors.background.DEFAULT,
          card: theme.colors.background.card,
          hover: theme.colors.background.hover,
        },
        foreground: {
          DEFAULT: theme.colors.foreground.DEFAULT,
          muted: theme.colors.foreground.muted,
        },
        primary: {
          DEFAULT: theme.colors.primary.DEFAULT,
          dark: theme.colors.primary.dark,
          light: theme.colors.primary.light,
          subtle: theme.colors.primary.subtle,
        },
        border: {
          DEFAULT: theme.colors.border.DEFAULT,
          subtle: theme.colors.border.subtle,
        },
        ring: {
          DEFAULT: theme.colors.ring.DEFAULT,
        },
      },
      spacing: theme.spacing,
      borderRadius: theme.radii,
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};

export default config;
