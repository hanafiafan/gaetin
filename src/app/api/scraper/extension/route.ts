import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils";
import { env } from "@/lib/env";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Extension-Token",
};

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
      select: { id: true, workspaceId: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job ID tidak ditemukan" }, { status: 404, headers: CORS });
    }

    // Validasi HMAC token — deterministik dari job.id + workspaceId + JWT_SECRET.
    const receivedToken = req.headers.get("X-Extension-Token") ?? "";
    const expectedToken = createHmac("sha256", env.JWT_SECRET)
      .update(`${job.id}:${job.workspaceId}`)
      .digest("hex");
    const tokenBuf = Buffer.from(receivedToken.padEnd(expectedToken.length, "\0"));
    const expectedBuf = Buffer.from(expectedToken);
    const tokenValid =
      receivedToken.length === expectedToken.length &&
      timingSafeEqual(tokenBuf, expectedBuf);
    if (!tokenValid) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401, headers: CORS });
    }

    // Process leads
    let added = 0;
    let duplicates = 0;

    for (const l of leads) {
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

    return NextResponse.json({ success: true, added }, { headers: CORS });
  } catch (error: any) {
    console.error("Extension API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }
}
