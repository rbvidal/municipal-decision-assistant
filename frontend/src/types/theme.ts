export interface ColorTokens {
  primary: {
    900: string;
    700: string;
    500: string;
    100: string;
    50: string;
  };
  gray: {
    900: string;
    700: string;
    600: string;
    500: string;
    400: string;
    300: string;
    200: string;
    100: string;
    50: string;
  };
  semantic: {
    success: { 700: string; 100: string; 50: string };
    warning: { 700: string; 100: string; 50: string };
    error: { 700: string; 100: string; 50: string };
    info: { 700: string; 100: string; 50: string };
  };
  background: {
    white: string;
    page: string;
  };
}

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    h1: [string, { lineHeight: string; fontWeight: string }];
    h2: [string, { lineHeight: string; fontWeight: string }];
    h3: [string, { lineHeight: string; fontWeight: string }];
    body: [string, { lineHeight: string; fontWeight: string }];
    small: [string, { lineHeight: string; fontWeight: string }];
    caption: [string, { lineHeight: string; fontWeight: string }];
    stat: [string, { lineHeight: string; fontWeight: string }];
    code: [string, { lineHeight: string; fontWeight: string }];
  };
}

export interface SpacingTokens {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  14: string;
}

export interface BreakpointTokens {
  desktopFHD: string;
  desktop: string;
  laptop: string;
  tablet: string;
}

export type ZIndexLayer =
  | 'base'
  | 'dropdown'
  | 'sticky'
  | 'dialog'
  | 'toast';
