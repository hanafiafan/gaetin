import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        whatsapp: {
          DEFAULT: "hsl(var(--whatsapp))",
          foreground: "hsl(var(--whatsapp-foreground))",
        },
        email: {
          DEFAULT: "hsl(var(--email))",
          foreground: "hsl(var(--email-foreground))",
        },
        kelola: {
          DEFAULT: "hsl(var(--kelola))",
          foreground: "hsl(var(--kelola-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      // Sharp corners everywhere; only `rounded-full` stays round (icon buttons, badges).
      // Restored to real values — the fully-sharp scale read as "kaku"
      // (stiff/rigid) once seen across the whole app with real content.
      // Every rounded-* class already present in ~30 pre-redesign components
      // (they were only neutralized by this config, never stripped) picks
      // this back up automatically, no component edits needed for those.
      borderRadius: {
        none: "0",
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
        full: "9999px",
      },
      /* Skala tipe dinaikkan satu tingkat di seluruh aplikasi.
         Audit sebelum perubahan: 191 teks berukuran 12px atau lebih kecil
         (173x text-xs, plus 11px dan 10px hardcoded) dan hanya 13 teks
         berukuran 16px ke atas. Itu bukan soal selera — itu di bawah ambang
         nyaman baca untuk mata yang sudah menua.

         Menaikkannya di sini, bukan di ~400 tempat pemakaian: text-sm adalah
         ukuran badan teks paling umum di app ini, jadi 15px membuat hampir
         semua teks ikut naik sekaligus. line-height juga dilonggarkan; teks
         rapat lebih sulit diikuti mata daripada teks kecil. */
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.15rem" }],   // 13px (dari 12)
        sm: ["0.9375rem", { lineHeight: "1.45rem" }],   // 15px (dari 14)
        base: ["1.0625rem", { lineHeight: "1.65rem" }], // 17px (dari 16)
        lg: ["1.1875rem", { lineHeight: "1.75rem" }],   // 19px (dari 18)
        xl: ["1.375rem", { lineHeight: "1.85rem" }],    // 22px (dari 20)
        "2xl": ["1.625rem", { lineHeight: "2.1rem" }],
        "3xl": ["2rem", { lineHeight: "2.4rem" }],
        "4xl": ["2.5rem", { lineHeight: "2.8rem" }],
        "5xl": ["3.25rem", { lineHeight: "1.05" }],
        "6xl": ["4rem", { lineHeight: "1.02" }],
        "7xl": ["4.75rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      // Neobrutalism signature: hard-edged offset shadows (no blur), not soft
      // drop shadows. Colored via --foreground so it stays black in this theme.
      boxShadow: {
        brutal: "4px 4px 0px 0px hsl(var(--foreground))",
        "brutal-sm": "2px 2px 0px 0px hsl(var(--foreground))",
        "brutal-lg": "6px 6px 0px 0px hsl(var(--foreground))",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
