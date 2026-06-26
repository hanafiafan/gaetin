// Render pesan: spintax (variasi anti-spam) + personalisasi variabel.

/** Pilih satu varian acak untuk setiap blok spintax `{a|b|c}` (harus ada pipe). */
export function renderSpintax(text: string): string {
  return text.replace(/\{([^{}]*\|[^{}]*)\}/g, (_m, group: string) => {
    const opts = group.split("|");
    return opts[Math.floor(Math.random() * opts.length)] ?? "";
  });
}

/** Ganti `{{nama}}`, `{{kota}}`, dll. dengan nilai dari `vars` (case-insensitive). */
export function applyVariables(text: string, vars: Record<string, string | null | undefined>): string {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) lower[k.toLowerCase()] = v ?? "";
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => lower[key.toLowerCase()] ?? "");
}

/** Gabungan: spintax dulu, lalu variabel. */
export function renderMessage(
  template: string,
  vars: Record<string, string | null | undefined>,
): string {
  return applyVariables(renderSpintax(template), vars);
}
