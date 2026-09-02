import { prisma } from "@/lib/db/prisma";

async function getEmailSettings() {
  const keys = ["email_provider", "email_api_key", "email_from"];
  const settings = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = typeof s.value === "string" ? s.value : String(s.value ?? "");
  }
  return {
    provider: map.email_provider ?? "",
    apiKey: map.email_api_key ?? "",
    from: map.email_from ?? "noreply@hellens.dev",
  };
}

export async function isEmailConfigured(): Promise<boolean> {
  const cfg = await getEmailSettings();
  return !!(cfg.provider && cfg.apiKey);
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/** Kirim satu email lewat provider yang dikonfigurasi admin (Settings > Integrasi). */
export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getEmailSettings();
  if (!cfg.provider || !cfg.apiKey) return { ok: false, error: "EMAIL_NOT_CONFIGURED" };

  if (cfg.provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: cfg.from, to: input.to, subject: input.subject, html: input.html }),
    }).catch(() => null);
    if (!res || !res.ok) return { ok: false, error: `Resend error (${res?.status ?? "network"})` };
    return { ok: true };
  }

  return { ok: false, error: `Provider tidak didukung: ${cfg.provider}` };
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const subject = "Selamat datang di Hellens! 🚀";
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h1 style="font-size:24px;color:#1e293b">Halo, ${name}! 👋</h1>
      <p style="color:#475569;line-height:1.6">
        Akun Hellens kamu sudah aktif. Sekarang kamu bisa mulai scraping Google Maps dan mengekspor prospek ke CSV.
      </p>
      <p style="color:#475569;line-height:1.6">
        <strong>Yang bisa kamu lakukan sekarang:</strong><br/>
        1. Install ekstensi Chrome dari dashboard<br/>
        2. Buka Google Maps dan aktifkan mode scraping<br/>
        3. Ekspor hasilnya ke CSV
      </p>
      <a href="https://scraper.hellens.dev/dashboard/setup"
         style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:99px;text-decoration:none;font-weight:700">
        Mulai Setup
      </a>
      <p style="margin-top:32px;font-size:12px;color:#94a3b8">
        Butuh bantuan? Hubungi kami di support@hellens.dev
      </p>
    </div>`;

  await sendEmail({ to, subject, html }).catch(() => undefined);
}
