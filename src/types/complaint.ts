import { z } from "zod";

export const ComplaintCategoryEnum = z.enum([
  "overcharging",
  "refusal_of_service",
  "harassment",
  "unsafe_driving",
  "meter_tampering",
  "route_deviation",
  "luggage_issues",
  "other",
]);

export const SeverityEnum = z.enum(["low", "medium", "high", "critical"]);

export const ComplaintStatusEnum = z.enum([
  "open",
  "acknowledged",
  "investigating",
  "resolved",
  "escalated",
  "closed",
]);

export const SupportedLanguageEnum = z.enum(["en", "ru", "de", "he", "fr"]);

export const SubmitComplaintSchema = z.object({
  touristName: z.string().min(1, "Name is required"),
  touristPhone: z.string().min(5, "Valid phone number required"),
  touristEmail: z.string().email().optional().or(z.literal("")),
  nationality: z.string().optional(),
  preferredLanguage: SupportedLanguageEnum.default("en"),
  complaintText: z.string().min(10, "Please describe the incident in detail"),
  vehicleNumber: z.string().optional(),
  incidentLocation: z.string().optional(),
  incidentDatetime: z.string().optional(),
  fareCharged: z.number().positive().optional(),
});

export type SubmitComplaintInput = z.infer<typeof SubmitComplaintSchema>;

export type ComplaintCategory = z.infer<typeof ComplaintCategoryEnum>;
export type Severity = z.infer<typeof SeverityEnum>;
export type ComplaintStatus = z.infer<typeof ComplaintStatusEnum>;
export type SupportedLanguage = z.infer<typeof SupportedLanguageEnum>;

export interface AICategorizationResult {
  category: ComplaintCategory;
  subcategory: string | null;
  severity: Severity;
  confidence: number;
  summary: string;
  extractedFareCharged: number | null;
  extractedFareExpected: number | null;
  extractedVehicleNumber: string | null;
  sentimentScore: number;
}

export interface ComplaintWithDetails {
  id: string;
  complaintNumber: string;
  category: ComplaintCategory;
  subcategory: string | null;
  severity: Severity;
  status: ComplaintStatus;
  originalText: string;
  originalLanguage: string;
  translatedText: string | null;
  aiSummary: string | null;
  aiCategoryConfidence: number | null;
  fareCharged: number | null;
  fareExpected: number | null;
  incidentLocation: string | null;
  incidentDatetime: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  tourist: {
    fullName: string;
    nationality: string | null;
    phone: string;
    preferredLang: string;
  } | null;
  taxiPermit: {
    permitNumber: string;
    driverName: string;
    vehicleNumber: string;
    zone: string | null;
    complaintCount: number;
  } | null;
  escalations: {
    id: string;
    officerId: string;
    status: string;
    priority: number;
    assignedAt: string;
    officer: {
      name: string;
      zone: string;
    };
  }[];
}

export interface DashboardStats {
  openCases: number;
  inProgress: number;
  slaBreaches: number;
  todayTotal: number;
  resolvedToday: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  totalComplaints: number;
}

export interface BlacklistEntry {
  id: string;
  taxiPermitId: string;
  reason: string;
  totalComplaints: number;
  blacklistedAt: string;
  status: string;
  taxiPermit: {
    permitNumber: string;
    driverName: string;
    vehicleNumber: string;
    zone: string | null;
  };
}
