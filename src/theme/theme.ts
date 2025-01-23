export const colors = {
  background: {
    DEFAULT: 'hsl(165, 20%, 8%)',
    card: 'hsl(165, 20%, 12%)',
    hover: 'hsl(165, 20%, 15%)',
  },
  foreground: {
    DEFAULT: 'hsl(0, 0%, 100%)',
    muted: 'hsl(165, 10%, 70%)',
  },
  primary: {
    DEFAULT: 'hsl(160, 84%, 39%)',
    dark: 'hsl(160, 84%, 32%)',
    light: 'hsl(160, 84%, 45%)',
    subtle: 'hsl(160, 84%, 39%, 0.1)',
  },
  border: {
    DEFAULT: 'hsl(165, 20%, 20%)',
    subtle: 'hsl(165, 20%, 15%)',
  },
  ring: {
    DEFAULT: 'hsl(160, 84%, 39%)',
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
};

export const theme = {
  colors,
  spacing,
  radii,
};

export type Theme = typeof theme;