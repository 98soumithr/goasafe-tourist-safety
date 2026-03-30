import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SEVERITY_CONFIG } from "@/lib/constants/fare-reference";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      // Run all queries in parallel for performance
      const [
        openCases,
        inProgressCases,
        todayTotal,
        resolvedToday,
        totalComplaints,
        allResolved,
        categoryBreakdown,
        severityBreakdown,
        topOffenders,
        allComplaints30d,
      ] = await Promise.all([
        // Open cases
        prisma.complaint.count({ where: { status: "open" } }),

        // In progress (acknowledged + investigating + escalated)
        prisma.complaint.count({
          where: { status: { in: ["acknowledged", "investigating", "escalated"] } },
        }),

        // Today's complaints
        prisma.complaint.count({
          where: { createdAt: { gte: todayStart } },
        }),

        // Resolved today
        prisma.complaint.count({
          where: {
            resolvedAt: { gte: todayStart },
            status: { in: ["resolved", "closed"] },
          },
        }),

        // Total
        prisma.complaint.count(),

        // All resolved complaints (for avg resolution time)
        prisma.complaint.findMany({
          where: {
            resolvedAt: { not: null },
          },
          select: {
            createdAt: true,
            resolvedAt: true,
          },
        }),

        // Category breakdown
        prisma.complaint.groupBy({
          by: ["category"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),

        // Severity breakdown
        prisma.complaint.groupBy({
          by: ["severity"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),

        // Top offenders — top 10 taxi permits by complaint count
        prisma.taxiPermit.findMany({
          where: { complaintCount: { gt: 0 } },
          select: {
            id: true,
            permitNumber: true,
            driverName: true,
            vehicleNumber: true,
            zone: true,
            complaintCount: true,
            permitStatus: true,
          },
          orderBy: { complaintCount: "desc" },
          take: 10,
        }),

        // Last 30 days complaints for daily trend
        prisma.complaint.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true },
        }),
      ]);

      // Calculate average resolution hours
      let avgResolutionHours = 0;
      if (allResolved.length > 0) {
        const totalHours = allResolved.reduce((sum, c) => {
          if (c.resolvedAt) {
            const diffMs = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
            return sum + diffMs / (1000 * 60 * 60);
          }
          return sum;
        }, 0);
        avgResolutionHours = Math.round((totalHours / allResolved.length) * 10) / 10;
      }

      // SLA breaches — complaints open longer than their severity's response time
      let slaBreaches = 0;
      const openComplaintsForSla = await prisma.complaint.findMany({
        where: {
          status: { in: ["open", "acknowledged", "investigating", "escalated"] },
        },
        select: { severity: true, createdAt: true },
      });

      for (const c of openComplaintsForSla) {
        const config = SEVERITY_CONFIG[c.severity as keyof typeof SEVERITY_CONFIG];
        if (config) {
          const elapsedMinutes = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60);
          if (elapsedMinutes > config.responseMinutes) {
            slaBreaches++;
          }
        }
      }

      // SLA compliance rate
      const slaComplianceRate =
        totalComplaints > 0
          ? Math.round(((totalComplaints - slaBreaches) / totalComplaints) * 1000) / 10
          : 100;

      // Build daily trend
      const dailyTrend: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const count = allComplaints30d.filter((c) => {
          const d = new Date(c.createdAt).toISOString().split("T")[0];
          return d === dateStr;
        }).length;
        dailyTrend.push({ date: dateStr, count });
      }

      // Zone distribution from taxi permits on complaints
      const zoneComplaints = await prisma.complaint.findMany({
        where: { taxiPermitId: { not: null } },
        select: {
          taxiPermit: { select: { zone: true } },
        },
      });

      const zoneMap: Record<string, number> = {};
      for (const c of zoneComplaints) {
        const zone = c.taxiPermit?.zone || "Unknown";
        zoneMap[zone] = (zoneMap[zone] || 0) + 1;
      }
      const zoneDistribution = Object.entries(zoneMap)
        .map(([zone, count]) => ({ zone, count }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({
        success: true,
        data: {
          openCases,
          inProgress: inProgressCases,
          slaBreaches,
          todayTotal,
          resolvedToday,
          avgResolutionHours,
          slaComplianceRate,
          totalComplaints,
          categoryBreakdown: categoryBreakdown.map((c) => ({
            category: c.category,
            count: c._count.id,
          })),
          severityBreakdown: severityBreakdown.map((s) => ({
            severity: s.severity,
            count: s._count.id,
          })),
          dailyTrend,
          topOffenders,
          zoneDistribution,
        },
      });
    } catch {
      // Database not available — return mock analytics for demo
      return NextResponse.json({
        success: true,
        data: {
          openCases: 12,
          inProgress: 8,
          slaBreaches: 3,
          todayTotal: 5,
          resolvedToday: 2,
          avgResolutionHours: 4.2,
          slaComplianceRate: 87.5,
          totalComplaints: 156,
          categoryBreakdown: [
            { category: "overcharging", count: 45 },
            { category: "refusal_of_service", count: 32 },
            { category: "harassment", count: 28 },
            { category: "unsafe_driving", count: 20 },
            { category: "meter_tampering", count: 15 },
            { category: "route_deviation", count: 10 },
            { category: "luggage_issues", count: 4 },
            { category: "other", count: 2 },
          ],
          severityBreakdown: [
            { severity: "low", count: 30 },
            { severity: "medium", count: 65 },
            { severity: "high", count: 45 },
            { severity: "critical", count: 16 },
          ],
          dailyTrend: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
            count: Math.floor(Math.random() * 8) + 1,
          })),
          topOffenders: [],
          zoneDistribution: [
            { zone: "Calangute", count: 38 },
            { zone: "Panjim", count: 25 },
            { zone: "Baga", count: 22 },
            { zone: "Anjuna", count: 18 },
            { zone: "Dabolim Airport", count: 15 },
          ],
        },
        _demo: true,
      });
    }
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
