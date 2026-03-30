import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET: List notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "admin";
    const unreadOnly = searchParams.get("unread") === "true";

    try {
      const where: Record<string, unknown> = { targetRole: role };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          complaint: {
            select: {
              complaintNumber: true,
              category: true,
              severity: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const data = notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        complaintId: n.complaintId,
        complaint: n.complaint,
        targetRole: n.targetRole,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }));

      return NextResponse.json({ success: true, data });
    } catch (dbError) {
      console.error("Notifications DB error:", dbError);
      return NextResponse.json({ success: true, data: [], _demo: true });
    }
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST: Create notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, message, complaintId, targetRole } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "type, title, and message are required" },
        { status: 400 }
      );
    }

    try {
      const notification = await prisma.notification.create({
        data: {
          type,
          title,
          message,
          complaintId: complaintId || null,
          targetRole: targetRole || "admin",
          isRead: false,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          complaintId: notification.complaintId,
          targetRole: notification.targetRole,
          isRead: notification.isRead,
          createdAt: notification.createdAt.toISOString(),
        },
      }, { status: 201 });
    } catch (dbError) {
      console.error("Notification create DB error:", dbError);
      return NextResponse.json({
        success: true,
        data: {
          id: `notif-${Date.now()}`,
          type,
          title,
          message,
          complaintId: complaintId || null,
          targetRole: targetRole || "admin",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        _demo: true,
      }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 });
  }
}

// PATCH: Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "ids array is required" },
        { status: 400 }
      );
    }

    try {
      await prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, data: { updated: ids.length } });
    } catch (dbError) {
      console.error("Notification mark-read DB error:", dbError);
      return NextResponse.json({ success: true, data: { updated: ids.length }, _demo: true });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update notifications" }, { status: 500 });
  }
}
