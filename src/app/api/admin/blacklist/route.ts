import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_BLACKLIST } from "@/lib/mock-data";

export async function GET() {
  try {
    const blacklist = await prisma.blacklist.findMany({
      include: { taxiPermit: true },
      orderBy: { blacklistedAt: "desc" },
    });

    // Transform to match the UI expected shape
    const data = blacklist.map((entry) => ({
      id: entry.id,
      taxiPermitId: entry.taxiPermitId,
      reason: entry.reason,
      complaintIds: JSON.parse(entry.complaintIds || "[]"),
      totalComplaints: entry.totalComplaints,
      blacklistedAt: entry.blacklistedAt.toISOString(),
      status: entry.status,
      reviewDate: entry.reviewDate?.toISOString() || null,
      reportWeek: entry.reportWeek.toISOString(),
      taxiPermit: {
        id: entry.taxiPermit.id,
        permitNumber: entry.taxiPermit.permitNumber,
        driverName: entry.taxiPermit.driverName,
        vehicleNumber: entry.taxiPermit.vehicleNumber,
        zone: entry.taxiPermit.zone || "Unknown",
        complaintCount: entry.taxiPermit.complaintCount,
        permitStatus: entry.taxiPermit.permitStatus,
      },
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Blacklist fetch error, falling back to mock:", error);
    return NextResponse.json({ success: true, data: MOCK_BLACKLIST, _demo: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taxiPermitId, reason, complaintIds } = body;

    if (!taxiPermitId || !reason) {
      return NextResponse.json({ success: false, error: "taxiPermitId and reason are required" }, { status: 400 });
    }

    try {
      const entry = await prisma.blacklist.create({
        data: {
          taxiPermitId,
          reason,
          complaintIds: JSON.stringify(complaintIds || []),
          totalComplaints: complaintIds?.length || 0,
          status: "active",
          reportWeek: new Date(),
        },
        include: { taxiPermit: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: entry.id,
          taxiPermitId: entry.taxiPermitId,
          reason: entry.reason,
          complaintIds: JSON.parse(entry.complaintIds || "[]"),
          totalComplaints: entry.totalComplaints,
          blacklistedAt: entry.blacklistedAt.toISOString(),
          status: entry.status,
          taxiPermit: {
            id: entry.taxiPermit.id,
            permitNumber: entry.taxiPermit.permitNumber,
            driverName: entry.taxiPermit.driverName,
            vehicleNumber: entry.taxiPermit.vehicleNumber,
            zone: entry.taxiPermit.zone || "Unknown",
          },
        },
      }, { status: 201 });
    } catch (dbError) {
      console.error("Blacklist create DB error, returning mock:", dbError);
      return NextResponse.json({
        success: true,
        data: {
          id: `bl-${Date.now()}`,
          taxiPermitId,
          reason,
          complaintIds: complaintIds || [],
          totalComplaints: complaintIds?.length || 0,
          blacklistedAt: new Date().toISOString(),
          status: "active",
        },
        _demo: true,
      }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create blacklist entry" }, { status: 500 });
  }
}
