"use server";

import { requireSuperAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

async function upsertSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function saveXenditSettings(formData: FormData) {
  await requireSuperAdmin();
  const fields = [
    "xendit_mode",
    "xendit_api_key",
    "xendit_secret_key",
    "xendit_sandbox_api_key",
    "xendit_sandbox_secret_key",
    "xendit_webhook_token",
  ];
  for (const key of fields) {
    const value = (formData.get(key) as string | null) ?? "";
    await upsertSetting(key, value);
  }
  return { success: true };
}

export async function saveGatewaySettings(formData: FormData) {
  await requireSuperAdmin();
  const fields = ["wa_gateway_url", "wa_gateway_token"];
  for (const key of fields) {
    const value = (formData.get(key) as string | null) ?? "";
    await upsertSetting(key, value);
  }
  return { success: true };
}

export async function saveEmailSettings(formData: FormData) {
  await requireSuperAdmin();
  const fields = ["email_provider", "email_api_key", "email_from"];
  for (const key of fields) {
    const value = (formData.get(key) as string | null) ?? "";
    await upsertSetting(key, value);
  }
  return { success: true };
}
