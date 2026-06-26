import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils";

export async function OPTIONS() {
  // Handle CORS preflight for the Chrome Extension
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, leads, isFinished } = body;

    if (!jobId || !Array.isArray(leads)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const job = await prisma.scraperJob.findUnique({
      where: { id: jobId },
      select: { id: true, workspaceId: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job ID tidak ditemukan" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
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
          rating: l.rating || null,
          reviewCount: l.reviewCount || null,
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

    return NextResponse.json({ success: true, added }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (error: any) {
    console.error("Extension API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}
