interface IntegerParamOptions {
  min: number;
  max: number;
  fallback: number;
}

/**
 * Parse an integer query parameter without allowing NaN, Infinity, fractions,
 * or out-of-range values to reach database pagination APIs.
 */
export function parseIntegerParam(value: string | null, options: IntegerParamOptions): number {
  if (value == null || value.trim() === "") return options.fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return options.fallback;

  return Math.min(options.max, Math.max(options.min, parsed));
}

export function parseEnumParam<const T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((candidate) => candidate === value);
}
