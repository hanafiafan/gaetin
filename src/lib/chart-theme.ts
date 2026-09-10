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
 * Palet untuk area kerja bertema gelap. Recharts merender atribut SVG, bukan
 * kelas, sehingga ia tidak bisa membaca variabel CSS — palet ini harus
 * dinyatakan literal dan mencerminkan token .cg-workspace di globals.css.
 *
 * Terpisah dari CHART karena konsol admin masih berlatar terang: memakai satu
 * palet untuk keduanya membuat salah satunya tidak terbaca. Sebelumnya
 * dashboard memakai CHART, sehingga batang #0A0A0A digambar di atas kartu
 * near-black dan praktis tidak terlihat.
 */
export const CHART_DARK = {
  accent: "#BBEF43",
  ink: "#F3F5F7",
  grid: "#2D3139",
  axis: "#9AA0A9",
  surface: "#1A1D24",
  success: "#5FD39B",
  warning: "#F5B547",
  destructive: "#F07A7A",
} as const;

export const CHART_DARK_SERIES = [
  CHART_DARK.accent,
  "#7FB3FF",
  CHART_DARK.success,
  "#C6A0FF",
  CHART_DARK.warning,
  "#8A8F98",
  CHART_DARK.destructive,
  "#4F545C",
] as const;

/** Sorotan hover versi gelap — wash terang, kebalikan dari versi terang. */
export const CHART_DARK_CURSOR_FILL = "rgba(243, 245, 247, 0.07)";
export const CHART_DARK_CURSOR_LINE = { stroke: CHART_DARK.axis, strokeWidth: 1 } as const;

export const CHART_DARK_TOOLTIP = {
  background: CHART_DARK.surface,
  border: `1px solid ${CHART_DARK.grid}`,
  borderRadius: 12,
  color: CHART_DARK.ink,
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
