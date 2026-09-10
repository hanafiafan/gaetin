import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils";
import { env } from "@/lib/env";
import { getWorkspacePlan } from "@/lib/plans/limits";

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
    const body = await req.json();
    const { jobId, leads, isFinished } = body;

    if (!jobId || !Array.isArray(leads)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: CORS });
    }

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
    if (job.status !== "RUNNING" || jobAgeMs > JOB_INGEST_WINDOW_MS) {
      return NextResponse.json(
        { error: "Job sudah selesai atau kedaluwarsa" },
        { status: 409, headers: CORS },
      );
    }

    // Validasi Sesi Browser atau HMAC Token
    const { getSession } = await import("@/lib/auth/session");
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
    const existingCount = await prisma.lead.count({ where: { scraperJobId: job.id } });
    const remaining = Math.max(0, plan.limits.scraperMaxResultsPerJob - existingCount);
    const accepted = leads.slice(0, remaining);
    const rejected = leads.length - accepted.length;

    // Process leads
    let added = 0;
    let duplicates = 0;

    for (const l of accepted) {
      const phone = l.phone ? normalizePhone(l.phone) : "";
      
      // Simple duplicate check within the same job to prevent inserting same place twice
      const existing = await prisma.lead.findFirst({
        where: {
          scraperJobId: job.id,
          OR: phone 
            ? [{ phone }, { businessName: l.businessName }] 
            : [{ businessName: l.businessName }]
        }
      });

      if (existing) {
        duplicates++;
        continue;
      }

      await prisma.lead.create({
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
          openingHours: l.openingHours ?? null,
          serviceOptions: l.serviceOptions ?? null,
          amenities: l.amenities ?? null,
          description: l.description || null,
          topReviews: l.topReviews ?? null,
          photos: l.photos ?? null,
        }
      });
      added++;
    }

    // Update job total found
    const updateData: any = {
      totalFound: { increment: added },
      duplicates: { increment: duplicates },
    };
    
    if (isFinished) {
      updateData.status = "COMPLETED";
    }

    await prisma.scraperJob.update({
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
  } catch (error: any) {
    console.error("Extension API error:", error);
    // Pesan error mentah membocorkan nama tabel/kolom Prisma ke pemanggil.
    return NextResponse.json({ error: "Gagal memproses lead" }, { status: 500, headers: CORS });
  }
}
