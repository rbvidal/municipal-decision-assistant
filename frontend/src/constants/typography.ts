export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Cascadia Code', monospace",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const TYPE_SCALE = {
  h1: { fontSize: "24px", lineHeight: "32px", fontWeight: "600" },
  h2: { fontSize: "20px", lineHeight: "28px", fontWeight: "600" },
  h3: { fontSize: "16px", lineHeight: "24px", fontWeight: "600" },
  body: { fontSize: "14px", lineHeight: "20px", fontWeight: "400" },
  small: { fontSize: "13px", lineHeight: "18px", fontWeight: "400" },
  caption: { fontSize: "12px", lineHeight: "16px", fontWeight: "400" },
  stat: { fontSize: "28px", lineHeight: "36px", fontWeight: "700" },
  code: { fontSize: "13px", lineHeight: "20px", fontWeight: "400" },
} as const;
