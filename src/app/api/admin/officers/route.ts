import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_OFFICERS } from "@/lib/mock-data";

export async function GET() {
  try {
    const officers = await prisma.tourismOfficer.findMany({
      include: {
        escalations: {
          select: { id: true, status: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = officers.map((officer) => {
      const totalCases = officer.escalations.length;
      const completedCases = officer.escalations.filter((e) => e.status === "completed").length;
      const activeCases = officer.escalations.filter((e) => e.status !== "completed").length;
      const resolutionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

      return {
        id: officer.id,
        name: officer.name,
        designation: officer.designation,
        phone: officer.phone,
        email: officer.email,
        zone: officer.zone,
        isActive: officer.isActive,
        dutyStatus: officer.dutyStatus,
        currentLat: officer.currentLat,
        currentLng: officer.currentLng,
        lastLocationUpdate: officer.lastLocationUpdate?.toISOString() || null,
        totalCases,
        activeCases,
        completedCases,
        resolutionRate,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Officers fetch error, falling back to mock:", error);
    return NextResponse.json({ success: true, data: MOCK_OFFICERS, _demo: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, designation, phone, email, zone } = body;

    if (!name || !phone || !zone) {
      return NextResponse.json(
        { success: false, error: "name, phone, and zone are required" },
        { status: 400 }
      );
    }

    try {
      const officer = await prisma.tourismOfficer.create({
        data: {
          name,
          designation: designation || null,
          phone,
          email: email || null,
          zone,
        },
      });

      return NextResponse.json({
        success: true,
        data: { ...officer, totalCases: 0, activeCases: 0, completedCases: 0, resolutionRate: 0 },
      }, { status: 201 });
    } catch (dbError) {
      console.error("Officer create DB error:", dbError);
      return NextResponse.json({
        success: true,
        data: { id: `off-${Date.now()}`, ...body, activeCases: 0, resolutionRate: 0 },
        _demo: true,
      }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create officer" }, { status: 500 });
  }
}
