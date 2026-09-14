import { getSession } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils";
import { env } from "@/lib/env";
import { getWorkspacePlan } from "@/lib/plans/limits";

const textField = z.string().max(10_000).nullish();
const jsonField = z.union([z.array(z.unknown()), z.record(z.unknown())]).nullish()
  .refine((value) => JSON.stringify(value ?? null).length <= 50_000);
const IngestSchema = z.object({
  jobId: z.string().min(1).max(100),
  isFinished: z.boolean().optional().default(false),
  leads: z.array(z.object({
    businessName: z.string().trim().min(1).max(500),
    phone: z.string().max(100).nullish(), website: textField, address: textField,
    category: textField, mapsUrl: textField, plusCode: textField, priceRange: textField,
    description: textField,
    rating: z.number().min(0).max(5).nullish(),
    reviewCount: z.number().int().min(0).max(2147483647).nullish(),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    openingHours: jsonField, serviceOptions: jsonField, amenities: jsonField,
    topReviews: jsonField, photos: jsonField,
  })).max(1000),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Extension-Token",
};

/** Sebuah sesi scraping berlangsung menit, bukan jam — 6 jam sudah sangat longgar. */
const JOB_INGEST_WINDOW_MS = 6 * 60 * 60 * 1000;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const parsed = IngestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Data lead tidak valid" }, { status: 400, headers: CORS });
    }
    const { jobId, leads, isFinished } = parsed.data;

    const job = await prisma.scraperJob.findUnique({
      where: { id: jobId },
      select: { id: true, workspaceId: true, status: true, createdAt: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job ID tidak ditemukan" }, { status: 404, headers: CORS });
    }

    // Token ekstensi adalah HMAC deterministik dari id job — tidak disimpan,
    // jadi tidak bisa dicabut. Umur job-lah yang membatasinya: token berhenti
    // berlaku begitu job selesai atau lewat batas waktu, sehingga token yang
    // bocor tidak memberi akses tulis selamanya ke lead workspace ini.
    const jobAgeMs = Date.now() - job.createdAt.getTime();
    if ((job.status !== "RUNNING" && !(job.status === "COMPLETED" && isFinished && leads.length === 0)) || jobAgeMs > JOB_INGEST_WINDOW_MS) {
      return NextResponse.json(
        { error: "Job sudah selesai atau kedaluwarsa" },
        { status: 409, headers: CORS },
      );
    }

    // Validasi Sesi Browser atau HMAC Token
    const session = await getSession();
    let isAuthorized = false;

    if (session && session.workspace?.id === job.workspaceId) {
      isAuthorized = true;
    } else {
      const receivedToken = req.headers.get("X-Extension-Token") ?? "";
      const expectedToken = createHmac("sha256", env.JWT_SECRET)
        .update(`${job.id}:${job.workspaceId}`)
        .digest("hex");
      const tokenBuf = Buffer.from(receivedToken.padEnd(expectedToken.length, "\0"));
      const expectedBuf = Buffer.from(expectedToken);
      isAuthorized =
        receivedToken.length === expectedToken.length &&
        timingSafeEqual(tokenBuf, expectedBuf);
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Token atau sesi tidak valid" }, { status: 401, headers: CORS });
    }

    // Batas lead per job sebelumnya hanya diiklankan, tidak pernah ditegakkan:
    // jalur ekstensi adalah satu-satunya mode yang aktif dan ia menerima array
    // sepanjang apa pun. Sisa kuota dihitung dari yang sudah masuk agar batas
    // berlaku untuk keseluruhan job, bukan per request.
    const plan = await getWorkspacePlan(job.workspaceId);
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "ScraperJob" WHERE id = ${job.id} FOR UPDATE`;
      const current = await tx.scraperJob.findUniqueOrThrow({ where: { id: job.id } });
      if (current.status === "COMPLETED" && isFinished && leads.length === 0) return NextResponse.json({ success: true, added: 0 }, { headers: CORS });
      if (current.status !== "RUNNING" || Date.now() - current.createdAt.getTime() > JOB_INGEST_WINDOW_MS) {
        return NextResponse.json({ error: "Job sudah selesai atau kedaluwarsa" }, { status: 409, headers: CORS });
      }
      const existingCount = await tx.lead.count({ where: { scraperJobId: job.id } });
      const remaining = Math.max(0, plan.limits.scraperMaxResultsPerJob - existingCount);
      let rejected = 0;

      // Process leads
      let added = 0;
      let duplicates = 0;

      for (const l of leads) {
        const phone = l.phone ? normalizePhone(l.phone) : "";

        // Simple duplicate check within the same job to prevent inserting same place twice
        const existing = await tx.lead.findFirst({
          where: {
            scraperJobId: job.id,
            OR: phone
              ? [{ phone }, { businessName: l.businessName, address: l.address || null }]
              : [{ businessName: l.businessName, address: l.address || null }]
          }
        });

        if (existing) {
          duplicates++;
          continue;
        }

        if (added >= remaining) { rejected++; continue; }
        await tx.lead.create({
          data: {
            workspaceId: job.workspaceId,
            scraperJobId: job.id,
            businessName: l.businessName,
            phone: phone || null,
            email: null,
            website: l.website || null,
            address: l.address || null,
            category: l.category || null,
            rating: typeof l.rating === "number" ? l.rating : null,
            reviewCount: typeof l.reviewCount === "number" ? l.reviewCount : null,
            latitude: typeof l.latitude === "number" ? l.latitude : null,
            longitude: typeof l.longitude === "number" ? l.longitude : null,
            mapsUrl: l.mapsUrl || null,
            plusCode: l.plusCode || null,
            priceRange: l.priceRange || null,
            openingHours: l.openingHours == null ? Prisma.DbNull : l.openingHours as Prisma.InputJsonValue,
            serviceOptions: l.serviceOptions == null ? Prisma.DbNull : l.serviceOptions as Prisma.InputJsonValue,
            amenities: l.amenities == null ? Prisma.DbNull : l.amenities as Prisma.InputJsonValue,
            description: l.description || null,
            topReviews: l.topReviews == null ? Prisma.DbNull : l.topReviews as Prisma.InputJsonValue,
            photos: l.photos == null ? Prisma.DbNull : l.photos as Prisma.InputJsonValue,
          }
        });
        added++;
      }

      // Update job total found
      const updateData: Prisma.ScraperJobUpdateInput = {
        totalFound: { increment: added },
        duplicates: { increment: duplicates },
      };

      if (isFinished) {
        updateData.status = "COMPLETED";
      }

      await tx.scraperJob.update({
        where: { id: job.id },
        data: updateData
      });

      return NextResponse.json(
        {
          success: true,
          added,
          ...(rejected > 0
            ? { rejected, limitReached: `Batas ${plan.limits.scraperMaxResultsPerJob} lead per job tercapai.` }
            : {}),
        },
        { headers: CORS },
      );
    }, { timeout: 30_000 });
  } catch (error) {
    console.error("Extension API error:", error);
    // Pesan error mentah membocorkan nama tabel/kolom Prisma ke pemanggil.
    return NextResponse.json({ error: "Gagal memproses lead" }, { status: 500, headers: CORS });
  }
}
