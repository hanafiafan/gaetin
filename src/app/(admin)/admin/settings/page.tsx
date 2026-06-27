import { prisma } from "@/lib/db/prisma";
import AdminIntegrationsClient from "./integrations-client";

export const dynamic = "force-dynamic";

const SETTING_KEYS = [
  "xendit_mode",
  "xendit_api_key",
  "xendit_secret_key",
  "xendit_sandbox_api_key",
  "xendit_sandbox_secret_key",
  "xendit_webhook_token",
  "wa_gateway_url",
  "wa_gateway_token",
  "email_provider",
  "email_api_key",
  "email_from",
];

export default async function AdminSettingsPage() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: SETTING_KEYS } },
  });

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = typeof row.value === "string" ? row.value : String(row.value ?? "");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Integrasi 3rd Party</h1>
        <p className="mt-1 text-sm text-slate-400">
          Kelola API key, webhook, dan mode (live/sandbox) untuk layanan eksternal.
        </p>
      </div>
      <AdminIntegrationsClient settings={settings} />
    </div>
  );
}
