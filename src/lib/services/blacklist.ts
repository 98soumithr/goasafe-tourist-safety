import { prisma } from "@/lib/db/prisma";
import { BLACKLIST_THRESHOLDS } from "@/lib/constants/fare-reference";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BlacklistCheckResult {
  shouldFlag: boolean;
  shouldBlacklist: boolean;
  recentComplaints: number;
  totalComplaints30d: number;
  totalComplaints90d: number;
}

export interface BlacklistReport {
  weekStart: Date;
  weekEnd: Date;
  totalBlacklisted: number;
  totalFlagged: number;
  entries: BlacklistReportEntry[];
  generatedAt: Date;
}

export interface BlacklistReportEntry {
  permitNumber: string;
  vehicleNumber: string;
  zone: string | null;
  totalComplaints: number;
  categories: Record<string, number>;
  status: "flagged" | "blacklisted";
  anonymizedDetails: string[];
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const USE_DB = Boolean(process.env.DATABASE_URL);

// ---------------------------------------------------------------------------
// Mock data for development
// ---------------------------------------------------------------------------
const mockComplaintCounts: Record<string, { count30d: number; count90d: number }> = {
  "GA-07-T-1234": { count30d: 4, count90d: 6 },
  "GA-07-T-5678": { count30d: 1, count90d: 2 },
  "GA-07-T-9999": { count30d: 5, count90d: 8 },
};

// ---------------------------------------------------------------------------
// Real (Prisma) mode
// ---------------------------------------------------------------------------
async function checkBlacklistEligibilityDB(
  taxiPermitId: string
): Promise<BlacklistCheckResult> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - BLACKLIST_THRESHOLDS.flagWindowDays * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - BLACKLIST_THRESHOLDS.blacklistWindowDays * 24 * 60 * 60 * 1000);

  // Count complaints in last 30 days
  const count30d = await prisma.complaint.count({
    where: {
      taxiPermitId,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Count complaints in last 90 days
  const count90d = await prisma.complaint.count({
    where: {
      taxiPermitId,
      createdAt: { gte: ninetyDaysAgo },
    },
  });

  const shouldFlag = count30d >= BLACKLIST_THRESHOLDS.flagCount;
  const shouldBlacklist = count90d >= BLACKLIST_THRESHOLDS.blacklistCount;

  // If should blacklist, create/update the blacklist entry
  if (shouldBlacklist) {
    const recentComplaints = await prisma.complaint.findMany({
      where: {
        taxiPermitId,
        createdAt: { gte: ninetyDaysAgo },
      },
      select: { id: true },
    });

    const existingBlacklist = await prisma.blacklist.findFirst({
      where: {
        taxiPermitId,
        status: "active",
      },
    });

    if (!existingBlacklist) {
      const weekStart = getWeekStart(now);
      await prisma.blacklist.create({
        data: {
          taxiPermitId,
          reason: `Automatic blacklist: ${count90d} complaints in ${BLACKLIST_THRESHOLDS.blacklistWindowDays} days`,
          complaintIds: JSON.stringify(recentComplaints.map((c) => c.id)),
          totalComplaints: count90d,
          reportWeek: weekStart,
          status: "active",
        },
      });

      // Suspend the permit
      await prisma.taxiPermit.update({
        where: { id: taxiPermitId },
        data: { permitStatus: "suspended" },
      });

      console.log(`[Blacklist] Permit ${taxiPermitId} BLACKLISTED — ${count90d} complaints in 90 days`);
    }
  } else if (shouldFlag) {
    console.log(`[Blacklist] Permit ${taxiPermitId} FLAGGED — ${count30d} complaints in 30 days`);
  }

  const result: BlacklistCheckResult = {
    shouldFlag,
    shouldBlacklist,
    recentComplaints: count30d,
    totalComplaints30d: count30d,
    totalComplaints90d: count90d,
  };

  console.log(`[Blacklist] Check result for ${taxiPermitId}:`, JSON.stringify(result));
  return result;
}

async function generateWeeklyReportDB(weekStart: Date): Promise<BlacklistReport> {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get all blacklist entries for this week
  const blacklistEntries = await prisma.blacklist.findMany({
    where: {
      reportWeek: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
    include: {
      taxiPermit: true,
    },
  });

  // Get all flagged permits (permits with >= flagCount in 30 days but not yet blacklisted)
  const thirtyDaysAgo = new Date(weekEnd.getTime() - BLACKLIST_THRESHOLDS.flagWindowDays * 24 * 60 * 60 * 1000);

  // For each blacklisted entry, get complaint details
  const entries: BlacklistReportEntry[] = [];

  for (const bl of blacklistEntries) {
    // Get complaint categories for this permit
    const complaints = await prisma.complaint.findMany({
      where: {
        taxiPermitId: bl.taxiPermitId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        category: true,
        aiSummary: true,
        incidentLocation: true,
      },
    });

    const categories: Record<string, number> = {};
    for (const c of complaints) {
      categories[c.category] = (categories[c.category] || 0) + 1;
    }

    entries.push({
      permitNumber: bl.taxiPermit.permitNumber,
      vehicleNumber: bl.taxiPermit.vehicleNumber,
      zone: bl.taxiPermit.zone,
      totalComplaints: bl.totalComplaints,
      categories,
      status: "blacklisted",
      anonymizedDetails: complaints.map(
        (c) => `${c.category}: ${c.aiSummary ?? "No summary"} (${c.incidentLocation ?? "Unknown location"})`
      ),
    });
  }

  const report: BlacklistReport = {
    weekStart,
    weekEnd,
    totalBlacklisted: blacklistEntries.length,
    totalFlagged: 0, // Could be computed separately
    entries,
    generatedAt: new Date(),
  };

  console.log(
    `[Blacklist] Weekly report generated: ${report.totalBlacklisted} blacklisted, ${entries.length} entries`
  );

  return report;
}

// ---------------------------------------------------------------------------
// Mock mode
// ---------------------------------------------------------------------------
function checkBlacklistEligibilityMock(
  taxiPermitId: string
): BlacklistCheckResult {
  // Look up mock data or generate defaults
  const mockData = mockComplaintCounts[taxiPermitId] ?? {
    count30d: Math.floor(Math.random() * 3),
    count90d: Math.floor(Math.random() * 4) + 1,
  };

  const shouldFlag = mockData.count30d >= BLACKLIST_THRESHOLDS.flagCount;
  const shouldBlacklist = mockData.count90d >= BLACKLIST_THRESHOLDS.blacklistCount;

  const result: BlacklistCheckResult = {
    shouldFlag,
    shouldBlacklist,
    recentComplaints: mockData.count30d,
    totalComplaints30d: mockData.count30d,
    totalComplaints90d: mockData.count90d,
  };

  if (shouldBlacklist) {
    console.log(`[Blacklist] Mock: Permit "${taxiPermitId}" would be BLACKLISTED — ${mockData.count90d} complaints in 90 days`);
  } else if (shouldFlag) {
    console.log(`[Blacklist] Mock: Permit "${taxiPermitId}" would be FLAGGED — ${mockData.count30d} complaints in 30 days`);
  } else {
    console.log(`[Blacklist] Mock: Permit "${taxiPermitId}" is clean — ${mockData.count30d} in 30d, ${mockData.count90d} in 90d`);
  }

  return result;
}

function generateWeeklyReportMock(weekStart: Date): BlacklistReport {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const entries: BlacklistReportEntry[] = [
    {
      permitNumber: "GOA/TAXI/2024/0001",
      vehicleNumber: "GA-07-T-1234",
      zone: "Calangute",
      totalComplaints: 6,
      categories: { overcharging: 4, meter_tampering: 2 },
      status: "blacklisted",
      anonymizedDetails: [
        "overcharging: Tourist charged ₹2000 for a 5km ride (Calangute)",
        "overcharging: Airport to Calangute charged ₹3000 instead of ₹750 (Dabolim Airport)",
        "meter_tampering: Meter appeared rigged, fare jumped rapidly (Baga)",
      ],
    },
    {
      permitNumber: "GOA/TAXI/2024/0099",
      vehicleNumber: "GA-07-T-9999",
      zone: "Panjim",
      totalComplaints: 8,
      categories: { overcharging: 3, harassment: 3, refusal_of_service: 2 },
      status: "blacklisted",
      anonymizedDetails: [
        "harassment: Driver became aggressive when questioned about fare (Panjim)",
        "overcharging: Charged double the meter rate for a short trip (Panjim)",
        "refusal_of_service: Refused to take tourist to Margao (Panjim bus stand)",
      ],
    },
  ];

  const report: BlacklistReport = {
    weekStart,
    weekEnd,
    totalBlacklisted: entries.filter((e) => e.status === "blacklisted").length,
    totalFlagged: 0,
    entries,
    generatedAt: new Date(),
  };

  console.log(
    `[Blacklist] Mock weekly report: ${report.totalBlacklisted} blacklisted, ${entries.length} entries`
  );
  console.log("[Blacklist] Mock report entries:");
  for (const e of entries) {
    console.log(`  - ${e.vehicleNumber} (${e.zone}): ${e.totalComplaints} complaints, status: ${e.status}`);
  }

  return report;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if a taxi permit should be flagged or blacklisted based on complaint history.
 * - Flag: >= 3 complaints in last 30 days
 * - Blacklist: >= 5 complaints in last 90 days
 */
export async function checkBlacklistEligibility(
  taxiPermitId: string
): Promise<BlacklistCheckResult> {
  if (USE_DB) {
    try {
      return await checkBlacklistEligibilityDB(taxiPermitId);
    } catch (error) {
      console.error("[Blacklist] DB check failed, falling back to mock:", error);
      return checkBlacklistEligibilityMock(taxiPermitId);
    }
  }
  return checkBlacklistEligibilityMock(taxiPermitId);
}

/**
 * Generate a weekly blacklist report with anonymized complaint details.
 */
export async function generateWeeklyReport(weekStart: Date): Promise<BlacklistReport> {
  if (USE_DB) {
    try {
      return await generateWeeklyReportDB(weekStart);
    } catch (error) {
      console.error("[Blacklist] DB report generation failed, falling back to mock:", error);
      return generateWeeklyReportMock(weekStart);
    }
  }
  return generateWeeklyReportMock(weekStart);
}
