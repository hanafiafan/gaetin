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
