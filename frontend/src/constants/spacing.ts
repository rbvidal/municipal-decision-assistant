export const SPACING = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  14: '56px',
} as const;

export const BREAKPOINTS = {
  desktopFHD: '1920px',
  desktop: '1280px',
  laptop: '1024px',
  tablet: '768px',
} as const;

export const Z_INDEX = {
  base: 1,
  dropdown: 100,
  sticky: 200,
  dialog: 500,
  toast: 1000,
} as const;

export const RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
} as const;

export const DURATION = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;
