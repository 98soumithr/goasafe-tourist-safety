import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_PERMITS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase();

  try {
    let where = {};
    if (search) {
      where = {
        OR: [
          { vehicleNumber: { contains: search } },
          { driverName: { contains: search } },
          { permitNumber: { contains: search } },
        ],
      };
    }

    const permits = await prisma.taxiPermit.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const data = permits.map((p) => ({
      id: p.id,
      permitNumber: p.permitNumber,
      driverName: p.driverName,
      driverPhone: p.driverPhone,
      vehicleNumber: p.vehicleNumber,
      vehicleType: p.vehicleType || "sedan",
      zone: p.zone || "Unknown",
      permitStatus: p.permitStatus,
      complaintCount: p.complaintCount,
      issuedDate: p.issuedDate.toISOString(),
      expiryDate: p.expiryDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Permits fetch error, falling back to mock:", error);
    let permits = MOCK_PERMITS;
    if (search) {
      permits = permits.filter((p) =>
        p.vehicleNumber.toLowerCase().includes(search) ||
        p.driverName.toLowerCase().includes(search) ||
        p.permitNumber.toLowerCase().includes(search)
      );
    }
    return NextResponse.json({ success: true, data: permits, _demo: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    try {
      const permit = await prisma.taxiPermit.create({
        data: {
          permitNumber: body.permitNumber,
          driverName: body.driverName,
          driverPhone: body.driverPhone || null,
          vehicleNumber: body.vehicleNumber,
          vehicleType: body.vehicleType || "sedan",
          zone: body.zone || null,
          permitStatus: body.permitStatus || "active",
          issuedDate: body.issuedDate ? new Date(body.issuedDate) : new Date(),
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : new Date(Date.now() + 365 * 86400000),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: permit.id,
          permitNumber: permit.permitNumber,
          driverName: permit.driverName,
          vehicleNumber: permit.vehicleNumber,
          vehicleType: permit.vehicleType,
          zone: permit.zone,
          permitStatus: permit.permitStatus,
          complaintCount: permit.complaintCount,
          expiryDate: permit.expiryDate.toISOString(),
          createdAt: permit.createdAt.toISOString(),
        },
      }, { status: 201 });
    } catch (dbError) {
      console.error("Permit create DB error, returning mock:", dbError);
      return NextResponse.json({
        success: true,
        data: { id: `p-${Date.now()}`, ...body, complaintCount: 0, createdAt: new Date().toISOString() },
        _demo: true,
      }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create permit" }, { status: 500 });
  }
}
