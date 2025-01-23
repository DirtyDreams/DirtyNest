import { theme } from './src/theme/theme';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
