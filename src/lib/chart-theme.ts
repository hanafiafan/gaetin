/**
 * Single source of truth for recharts styling.
 * Previously the admin analytics page and the dashboard analytics client each
 * hardcoded their own palette, and they disagreed on the primary series color.
 *
 * Mono ramp + the acid-yellow accent, matching the light theme. Recharts needs
 * literal colors (it renders SVG attributes, not classes), so these mirror the
 * CSS custom properties in globals.css rather than reading them.
 */
export const CHART = {
  accent: "#E4FF00",
  ink: "#0A0A0A",
  grid: "#E3E3E3",
  axis: "#666666",
  surface: "#FFFFFF",
  success: "#1F7D4F",
  warning: "#B26B06",
  destructive: "#D32222",
} as const;

/**
 * Palet untuk lembar terang di area kerja (.cg-sheet). Recharts merender
 * atribut SVG, bukan kelas, sehingga ia tidak bisa membaca variabel CSS —
 * palet ini harus dinyatakan literal dan mencerminkan token .cg-sheet.
 *
 * Terpisah dari CHART karena konsol admin masih memakai identitas
 * Swiss-brutalist-nya (kuning asam, sudut siku, border hitam), sementara
 * lembar ini bertema lime dengan garis rambut.
 *
 * Aksennya lime GELAP, bukan lime cerah yang dipakai tombol: #BBEF43 di atas
 * putih hanya ~1.5:1, jadi batang dan garisnya nyaris hilang.
 */
export const CHART_SHEET = {
  accent: "#7FA524",
  ink: "#141821",
  grid: "#D7DAE0",
  axis: "#5C636E",
  surface: "#FFFFFF",
  success: "#1F7D4F",
  warning: "#A86A08",
  destructive: "#C93B3B",
} as const;

export const CHART_SHEET_SERIES = [
  CHART_SHEET.accent,
  "#2563C9",
  CHART_SHEET.success,
  "#7040C0",
  CHART_SHEET.warning,
  "#5C636E",
  CHART_SHEET.destructive,
  "#9AA0A9",
] as const;

export const CHART_SHEET_CURSOR_FILL = "rgba(20, 24, 33, 0.06)";
export const CHART_SHEET_CURSOR_LINE = { stroke: CHART_SHEET.axis, strokeWidth: 1 } as const;

export const CHART_SHEET_TOOLTIP = {
  background: CHART_SHEET.surface,
  border: `1px solid ${CHART_SHEET.grid}`,
  borderRadius: 8,
  color: CHART_SHEET.ink,
  fontSize: 12,
} as const;

/** Categorical series ramp — accent first, then a light-to-dark mono spread. */
export const CHART_SERIES = [
  CHART.accent,
  CHART.ink,
  "#8A8A8A",
  "#C4C4C4",
  CHART.success,
  CHART.warning,
  "#4F4F4F",
  "#DEDEDE",
] as const;

/** Shared <Tooltip contentStyle={...}> — was duplicated ~14 times. */
export const CHART_TOOLTIP = {
  background: CHART.surface,
  border: `1px solid ${CHART.ink}`,
  borderRadius: 0,
  color: CHART.ink,
  fontSize: 12,
} as const;

/** Shared axis tick style. */
export const CHART_TICK = { fill: CHART.axis, fontSize: 11 } as const;

/**
 * Sorotan hover. Nilai sebelumnya rgba(255,255,255,…) — sisa dari tema gelap
 * yang benar-benar tidak terlihat di atas kartu terang, jadi grafik terasa
 * mati saat disentuh kursor.
 */
export const CHART_CURSOR_FILL = "rgba(10, 10, 10, 0.06)";
export const CHART_CURSOR_LINE = { stroke: CHART.axis, strokeWidth: 1 } as const;

/**
 * Tanpa batas ini, grafik batang dengan satu kategori merentangkan batangnya
 * selebar panel dan terbaca sebagai balok pekat, bukan grafik.
 */
export const CHART_MAX_BAR = 56;
