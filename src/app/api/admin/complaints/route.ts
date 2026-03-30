import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET: List all complaints with full details for admin dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { complaintNumber: { contains: search } },
        { originalText: { contains: search } },
        { aiSummary: { contains: search } },
        { incidentLocation: { contains: search } },
        { tourist: { fullName: { contains: search } } },
        { taxiPermit: { vehicleNumber: { contains: search } } },
        { taxiPermit: { driverName: { contains: search } } },
      ];
    }

    // Build sort — only allow safe fields
    const allowedSortFields = ["createdAt", "severity", "status", "category", "complaintNumber"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderBy = { [safeSortBy]: sortOrder };

    try {
      const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
          where,
          include: {
            tourist: {
              select: {
                id: true,
                fullName: true,
                nationality: true,
                phone: true,
                email: true,
                preferredLang: true,
              },
            },
            taxiPermit: {
              select: {
                id: true,
                permitNumber: true,
                driverName: true,
                vehicleNumber: true,
                vehicleType: true,
                zone: true,
                permitStatus: true,
                complaintCount: true,
              },
            },
            escalations: {
              include: {
                officer: {
                  select: {
                    id: true,
                    name: true,
                    zone: true,
                    dutyStatus: true,
                  },
                },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.complaint.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: complaints,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch {
      // Database not available — return mock data for demo
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        _demo: true,
      });
    }
  } catch (error) {
    console.error("Admin complaints list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
