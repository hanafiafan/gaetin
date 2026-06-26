// Design tokens untuk UI modern Gaetin.
// Aksen utama mengikuti tema hijau yang dipakai di aplikasi.

export const colors = {
  // Primary palette - emerald green
  primary: {
    50: "hsl(151, 78%, 96%)",
    100: "hsl(151, 78%, 91%)",
    200: "hsl(151, 78%, 82%)",
    300: "hsl(151, 78%, 68%)",
    400: "hsl(151, 78%, 55%)",
    500: "hsl(151, 78%, 47%)",
    600: "hsl(151, 78%, 37%)",
    700: "hsl(151, 78%, 28%)",
    800: "hsl(151, 78%, 20%)",
    900: "hsl(151, 78%, 12%)",
  },

  // Accent colors
  lime: {
    500: "hsl(82, 90%, 61%)",
    600: "hsl(82, 82%, 45%)",
  },

  cyan: {
    500: "hsl(190, 94%, 58%)",
    600: "hsl(190, 80%, 42%)",
  },

  // Status colors
  success: {
    500: "hsl(142, 76%, 36%)",
    600: "hsl(142, 76%, 26%)",
  },

  warning: {
    500: "hsl(38, 92%, 50%)",
    600: "hsl(38, 92%, 40%)",
  },

  error: {
    500: "hsl(0, 84%, 60%)",
    600: "hsl(0, 84%, 50%)",
  },

  info: {
    500: "hsl(199, 89%, 48%)",
    600: "hsl(199, 89%, 38%)",
  },

  // Neutrals
  gray: {
    50: "hsl(210, 40%, 98%)",
    100: "hsl(210, 40%, 96%)",
    200: "hsl(214, 32%, 91%)",
    300: "hsl(213, 27%, 84%)",
    400: "hsl(215, 20%, 65%)",
    500: "hsl(215, 16%, 47%)",
    600: "hsl(215, 19%, 35%)",
    700: "hsl(215, 25%, 27%)",
    800: "hsl(217, 33%, 17%)",
    900: "hsl(222, 47%, 11%)",
  },
} as const;

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
} as const;

export const typography = {
  fontSizes: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1.2" }],
    "6xl": ["3.75rem", { lineHeight: "1.1" }],
  },

  fontWeights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
  },
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",

  // Glow effects untuk tema hijau Gaetin
  glow: "0 0 20px rgba(34, 197, 94, 0.3)",
  "glow-lg": "0 0 40px rgba(34, 197, 94, 0.4)",
  "glow-primary": "0 0 20px hsl(151, 78%, 47%, 0.3)",
  "glow-primary-lg": "0 0 40px hsl(151, 78%, 47%, 0.4)",
} as const;

export const gradients = {
  primary: "linear-gradient(135deg, hsl(151, 78%, 47%) 0%, hsl(124, 70%, 52%) 50%, hsl(82, 90%, 61%) 100%)",
  "primary-subtle": "linear-gradient(135deg, hsl(151, 78%, 96%) 0%, hsl(124, 70%, 96%) 50%, hsl(82, 90%, 95%) 100%)",
  card: "linear-gradient(135deg, hsl(0, 0%, 100%) 0%, hsl(0, 0%, 100%) 60%, hsl(151, 78%, 96%) 100%)",
  mesh: "linear-gradient(135deg, var(--tw-gradient-stops))",
  radial: "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
} as const;

export const animations = {
  durations: {
    fast: "150ms",
    base: "300ms",
    slow: "500ms",
    slower: "1000ms",
  },

  easings: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// Helper function untuk generate gradient classes
export function getGradientClass(type: keyof typeof gradients = "primary") {
  return `bg-gradient-to-r from-primary via-emerald-500 to-lime-400`;
}

// Helper function untuk get shadow dengan glow effect
export function getGlowShadow(color: "primary" | "success" | "error" = "primary") {
  const colorMap = {
    primary: "151, 78%, 47%",
    success: "142, 76%, 36%",
    error: "0, 84%, 60%",
  };
  return `0 0 20px hsla(${colorMap[color]}, 0.3)`;
}
