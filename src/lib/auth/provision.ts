import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PIPELINE_COLUMNS } from "@/lib/crm/pipeline";
import { TRIAL_CREDITS } from "@/config/plans";

/**
 * Membuat akun baru beserta workspace, langganan trial, dan pipeline awalnya.
 *
 * Dipakai dua jalur pendaftaran — formulir biasa dan masuk lewat Google. Kalau
 * disalin dua kali, cepat atau lambat pengguna dari salah satu jalur akan
 * kehilangan sesuatu (kredit trial, kolom pipeline) tanpa ada yang menyadarinya.
 */

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return base || "workspace";
}

export const MASA_TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AkunBaru {
  name: string;
  email: string;
  /** Kosong untuk akun Google: orangnya belum pernah memilih password. */
  passwordHash?: string | null;
  googleId?: string | null;
}

export async function buatAkunDenganWorkspace(input: AkunBaru) {
  const trialEndsAt = new Date(Date.now() + MASA_TRIAL_MS);
  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash ?? null,
        googleId: input.googleId ?? null,
        preferences: { create: {} },
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `Workspace ${input.name}`,
        slug,
        credits: TRIAL_CREDITS,
        branding: { create: {} },
        subscription: { create: { plan: "GROWTH", status: "TRIAL", trialEndsAt } },
        memberships: { create: { userId: user.id, role: "OWNER" } },
        pipelines: {
          create: {
            name: "Sales Pipeline",
            columns: { create: DEFAULT_PIPELINE_COLUMNS },
          },
        },
      },
    });

    return { user, workspace };
  });
}
