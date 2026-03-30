import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ComplaintStatusEnum } from "@/types/complaint";
import { z } from "zod";

const UpdateComplaintSchema = z.object({
  status: ComplaintStatusEnum.optional(),
  notes: z.string().optional(),
});

// GET: Get complaint by ID or complaint number
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      // Try to find by ID first, then by complaint number
      const complaint = await prisma.complaint.findFirst({
        where: {
          OR: [
            { id },
            { complaintNumber: id },
          ],
        },
        include: {
          tourist: {
            select: {
              fullName: true,
              nationality: true,
              phone: true,
              preferredLang: true,
            },
          },
          taxiPermit: {
            select: {
              permitNumber: true,
              driverName: true,
              vehicleNumber: true,
              zone: true,
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
                  designation: true,
                  dutyStatus: true,
                },
              },
            },
            orderBy: { assignedAt: "desc" },
          },
        },
      });

      if (!complaint) {
        return NextResponse.json(
          { success: false, error: "Complaint not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: complaint,
      });
    } catch {
      // Database not available — return 404 for demo
      return NextResponse.json(
        { success: false, error: "Complaint not found (database unavailable)" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Get complaint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaint" },
      { status: 500 }
    );
  }
}

// PATCH: Update complaint status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateComplaintSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    try {
      // Find complaint
      const existing = await prisma.complaint.findFirst({
        where: {
          OR: [{ id }, { complaintNumber: id }],
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Complaint not found" },
          { status: 404 }
        );
      }

      // Build update payload
      const payload: Record<string, unknown> = {};
      if (updateData.status) {
        payload.status = updateData.status;
        if (updateData.status === "acknowledged" && !existing.acknowledgedAt) {
          payload.acknowledgedAt = new Date();
        }
        if (updateData.status === "resolved" || updateData.status === "closed") {
          payload.resolvedAt = new Date();
        }
      }

      const updated = await prisma.complaint.update({
        where: { id: existing.id },
        data: payload,
        include: {
          tourist: {
            select: {
              fullName: true,
              phone: true,
              preferredLang: true,
            },
          },
          taxiPermit: {
            select: {
              permitNumber: true,
              driverName: true,
              vehicleNumber: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to update complaint (database unavailable)" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Update complaint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
