import { prisma } from "@/lib/db/prisma";
import { SEVERITY_CONFIG, GOA_ZONES } from "@/lib/constants/fare-reference";
import type { Severity } from "@/types/complaint";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Officer {
  id: string;
  name: string;
  designation: string | null;
  phone: string;
  email: string | null;
  zone: string;
  dutyStatus: string;
}

export interface Escalation {
  id: string;
  complaintId: string;
  officerId: string;
  escalationType: string;
  priority: number;
  status: string;
  assignedAt: Date;
}

// ---------------------------------------------------------------------------
// Zone adjacency map for expanding officer search
// ---------------------------------------------------------------------------
const ZONE_ADJACENCY: Record<string, string[]> = {
  Calangute: ["Candolim", "Baga", "Anjuna"],
  Candolim: ["Calangute", "Panjim"],
  Baga: ["Calangute", "Anjuna"],
  Anjuna: ["Baga", "Calangute", "Mapusa"],
  Panjim: ["Candolim", "Mapusa", "Vasco"],
  Mapusa: ["Anjuna", "Panjim"],
  Vasco: ["Panjim", "Mormugao", "Dabolim Airport"],
  Mormugao: ["Vasco", "Dabolim Airport"],
  "Dabolim Airport": ["Vasco", "Mormugao", "Margao"],
  Margao: ["Colva", "Dabolim Airport"],
  Colva: ["Margao"],
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const USE_DB = Boolean(process.env.DATABASE_URL);

// ---------------------------------------------------------------------------
// Mock data for development without DB
// ---------------------------------------------------------------------------
const MOCK_OFFICERS: Officer[] = [
  {
    id: "officer-001",
    name: "Rajesh Naik",
    designation: "Tourism Inspector",
    phone: "+919876543210",
    email: "rajesh.naik@goatourism.gov.in",
    zone: "Calangute",
    dutyStatus: "on_duty",
  },
  {
    id: "officer-002",
    name: "Priya Dessai",
    designation: "Senior Tourism Officer",
    phone: "+919876543211",
    email: "priya.dessai@goatourism.gov.in",
    zone: "Panjim",
    dutyStatus: "on_duty",
  },
  {
    id: "officer-003",
    name: "Amit Kamat",
    designation: "Tourism Inspector",
    phone: "+919876543212",
    email: "amit.kamat@goatourism.gov.in",
    zone: "Margao",
    dutyStatus: "on_duty",
  },
  {
    id: "officer-004",
    name: "Sonia Fernandes",
    designation: "Zone Supervisor",
    phone: "+919876543213",
    email: "sonia.fernandes@goatourism.gov.in",
    zone: "Dabolim Airport",
    dutyStatus: "on_duty",
  },
];

let mockEscalationCounter = 0;
const mockEscalations: Escalation[] = [];

// ---------------------------------------------------------------------------
// Severity → Priority mapping
// ---------------------------------------------------------------------------
function severityToPriority(severity: string): number {
  switch (severity) {
    case "critical":
      return 3;
    case "high":
      return 2;
    case "medium":
    case "low":
    default:
      return 1;
  }
}

function severityToEscalationType(severity: string): string {
  const config = SEVERITY_CONFIG[severity as Severity];
  return config?.escalateTo ?? "zone_officer";
}

// ---------------------------------------------------------------------------
// Find nearest officer — Real (Prisma) mode
// ---------------------------------------------------------------------------
async function findNearestOfficerDB(zone: string): Promise<Officer | null> {
  // Step 1: Try exact zone match with on_duty officers
  const directMatch = await prisma.tourismOfficer.findFirst({
    where: {
      zone: zone,
      isActive: true,
      dutyStatus: "on_duty",
    },
    orderBy: { lastLocationUpdate: "desc" },
  });

  if (directMatch) {
    console.log(`[Escalation] Found officer in zone "${zone}": ${directMatch.name}`);
    return {
      id: directMatch.id,
      name: directMatch.name,
      designation: directMatch.designation,
      phone: directMatch.phone,
      email: directMatch.email,
      zone: directMatch.zone,
      dutyStatus: directMatch.dutyStatus,
    };
  }

  // Step 2: Expand to adjacent zones
  const adjacentZones = ZONE_ADJACENCY[zone] ?? [];
  if (adjacentZones.length > 0) {
    const adjacentMatch = await prisma.tourismOfficer.findFirst({
      where: {
        zone: { in: adjacentZones },
        isActive: true,
        dutyStatus: "on_duty",
      },
      orderBy: { lastLocationUpdate: "desc" },
    });

    if (adjacentMatch) {
      console.log(
        `[Escalation] No officer in "${zone}", found in adjacent zone "${adjacentMatch.zone}": ${adjacentMatch.name}`
      );
      return {
        id: adjacentMatch.id,
        name: adjacentMatch.name,
        designation: adjacentMatch.designation,
        phone: adjacentMatch.phone,
        email: adjacentMatch.email,
        zone: adjacentMatch.zone,
        dutyStatus: adjacentMatch.dutyStatus,
      };
    }
  }

  // Step 3: Any on-duty officer
  const anyOfficer = await prisma.tourismOfficer.findFirst({
    where: {
      isActive: true,
      dutyStatus: "on_duty",
    },
    orderBy: { lastLocationUpdate: "desc" },
  });

  if (anyOfficer) {
    console.log(
      `[Escalation] No officer near "${zone}", assigning from zone "${anyOfficer.zone}": ${anyOfficer.name}`
    );
    return {
      id: anyOfficer.id,
      name: anyOfficer.name,
      designation: anyOfficer.designation,
      phone: anyOfficer.phone,
      email: anyOfficer.email,
      zone: anyOfficer.zone,
      dutyStatus: anyOfficer.dutyStatus,
    };
  }

  console.log(`[Escalation] No on-duty officers available anywhere`);
  return null;
}

// ---------------------------------------------------------------------------
// Find nearest officer — Mock mode
// ---------------------------------------------------------------------------
function findNearestOfficerMock(zone: string): Officer | null {
  // Try exact zone
  const direct = MOCK_OFFICERS.find(
    (o) => o.zone.toLowerCase() === zone.toLowerCase() && o.dutyStatus === "on_duty"
  );
  if (direct) {
    console.log(`[Escalation] Mock: Found officer in zone "${zone}": ${direct.name}`);
    return direct;
  }

  // Try adjacent zones
  const adjacentZones = ZONE_ADJACENCY[zone] ?? [];
  for (const adj of adjacentZones) {
    const adjacent = MOCK_OFFICERS.find(
      (o) => o.zone.toLowerCase() === adj.toLowerCase() && o.dutyStatus === "on_duty"
    );
    if (adjacent) {
      console.log(`[Escalation] Mock: Found officer in adjacent zone "${adj}": ${adjacent.name}`);
      return adjacent;
    }
  }

  // Any on-duty officer
  const any = MOCK_OFFICERS.find((o) => o.dutyStatus === "on_duty");
  if (any) {
    console.log(`[Escalation] Mock: Fallback officer: ${any.name}`);
    return any;
  }

  console.log("[Escalation] Mock: No officers available");
  return null;
}

// ---------------------------------------------------------------------------
// Create escalation — Real (Prisma) mode
// ---------------------------------------------------------------------------
async function createEscalationDB(
  complaintId: string,
  officerId: string,
  severity: string
): Promise<Escalation> {
  const priority = severityToPriority(severity);
  const escalationType = severityToEscalationType(severity);

  const escalation = await prisma.escalation.create({
    data: {
      complaintId,
      officerId,
      escalationType,
      priority,
      status: "pending",
      notes: `Auto-assigned based on ${severity} severity`,
    },
  });

  // Update complaint status to escalated
  await prisma.complaint.update({
    where: { id: complaintId },
    data: { status: "escalated" },
  });

  console.log(
    `[Escalation] Created escalation ${escalation.id} — complaint: ${complaintId}, officer: ${officerId}, priority: ${priority}`
  );

  return {
    id: escalation.id,
    complaintId: escalation.complaintId,
    officerId: escalation.officerId,
    escalationType: escalation.escalationType,
    priority: escalation.priority,
    status: escalation.status,
    assignedAt: escalation.assignedAt,
  };
}

// ---------------------------------------------------------------------------
// Create escalation — Mock mode
// ---------------------------------------------------------------------------
function createEscalationMock(
  complaintId: string,
  officerId: string,
  severity: string
): Escalation {
  mockEscalationCounter++;
  const priority = severityToPriority(severity);
  const escalationType = severityToEscalationType(severity);

  const escalation: Escalation = {
    id: `esc-mock-${mockEscalationCounter}`,
    complaintId,
    officerId,
    escalationType,
    priority,
    status: "pending",
    assignedAt: new Date(),
  };

  mockEscalations.push(escalation);

  console.log(
    `[Escalation] Mock: Created escalation ${escalation.id} — complaint: ${complaintId}, officer: ${officerId}, priority: ${priority}, type: ${escalationType}`
  );

  return escalation;
}

// ---------------------------------------------------------------------------
// Auto-escalation check — find stale escalations and bump them
// ---------------------------------------------------------------------------
async function checkAutoEscalationDB(): Promise<void> {
  const now = new Date();

  // For each severity level, find pending escalations past their timeout
  for (const [severity, config] of Object.entries(SEVERITY_CONFIG)) {
    const cutoff = new Date(now.getTime() - config.responseMinutes * 60 * 1000);

    const staleEscalations = await prisma.escalation.findMany({
      where: {
        status: "pending",
        assignedAt: { lt: cutoff },
        complaint: { severity: severity as Severity },
      },
      include: {
        complaint: true,
        officer: true,
      },
    });

    for (const esc of staleEscalations) {
      console.log(
        `[Escalation] Auto-escalating ${esc.id} — assigned ${Math.round(
          (now.getTime() - esc.assignedAt.getTime()) / 60000
        )}min ago, SLA: ${config.responseMinutes}min`
      );

      // Mark current escalation as stale
      await prisma.escalation.update({
        where: { id: esc.id },
        data: {
          status: "completed",
          notes: `Auto-escalated: exceeded ${config.responseMinutes}min SLA`,
          completedAt: now,
        },
      });

      // Find a supervisor-level officer
      if (config.escalateTo) {
        const supervisor = await prisma.tourismOfficer.findFirst({
          where: {
            isActive: true,
            dutyStatus: "on_duty",
            designation: { contains: "supervisor" },
          },
        });

        if (supervisor) {
          await prisma.escalation.create({
            data: {
              complaintId: esc.complaintId,
              officerId: supervisor.id,
              escalationType: config.escalateTo,
              priority: severityToPriority(severity) + 1, // Bump priority
              status: "pending",
              notes: `Auto-escalated from officer ${esc.officer.name}`,
            },
          });
          console.log(`[Escalation] Re-assigned to supervisor: ${supervisor.name}`);
        }
      }
    }
  }
}

function checkAutoEscalationMock(): void {
  const now = new Date();
  let escalatedCount = 0;

  for (const esc of mockEscalations) {
    if (esc.status !== "pending") continue;

    // Check if past the timeout for any severity (use 30min default for mock)
    const ageMinutes = (now.getTime() - esc.assignedAt.getTime()) / 60000;
    if (ageMinutes > 30) {
      esc.status = "completed";
      escalatedCount++;
      console.log(
        `[Escalation] Mock: Auto-escalated ${esc.id} (pending for ${Math.round(ageMinutes)}min)`
      );
    }
  }

  if (escalatedCount === 0) {
    console.log("[Escalation] Mock: No stale escalations found");
  } else {
    console.log(`[Escalation] Mock: Auto-escalated ${escalatedCount} stale escalation(s)`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find the nearest on-duty tourism officer for a given zone.
 * Expands search to adjacent zones if no officer is found in the exact zone.
 */
export async function findNearestOfficer(zone: string): Promise<Officer | null> {
  if (USE_DB) {
    try {
      return await findNearestOfficerDB(zone);
    } catch (error) {
      console.error("[Escalation] DB query failed, falling back to mock:", error);
      return findNearestOfficerMock(zone);
    }
  }
  return findNearestOfficerMock(zone);
}

/**
 * Create an escalation record assigning a complaint to an officer.
 * Priority is derived from severity: critical=3, high=2, medium/low=1.
 */
export async function createEscalation(
  complaintId: string,
  officerId: string,
  severity: string
): Promise<Escalation> {
  if (USE_DB) {
    try {
      return await createEscalationDB(complaintId, officerId, severity);
    } catch (error) {
      console.error("[Escalation] DB create failed, falling back to mock:", error);
      return createEscalationMock(complaintId, officerId, severity);
    }
  }
  return createEscalationMock(complaintId, officerId, severity);
}

/**
 * Check for escalations that have exceeded their SLA timeout and auto-escalate
 * to a supervisor. Should be called periodically (e.g., via cron).
 */
export async function checkAutoEscalation(): Promise<void> {
  if (USE_DB) {
    try {
      return await checkAutoEscalationDB();
    } catch (error) {
      console.error("[Escalation] Auto-escalation DB check failed:", error);
      return checkAutoEscalationMock();
    }
  }
  return checkAutoEscalationMock();
}
