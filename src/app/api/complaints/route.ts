import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SubmitComplaintSchema } from "@/types/complaint";
import { generateComplaintNumber } from "@/lib/utils";
import type { ComplaintCategory, Severity } from "@/types/complaint";

// Mock AI categorization for prototype (no OpenAI key yet)
function mockAICategorization(text: string): {
  category: ComplaintCategory;
  severity: Severity;
  confidence: number;
  summary: string;
  sentimentScore: number;
} {
  const lowerText = text.toLowerCase();

  let category: ComplaintCategory = "other";
  let severity: Severity = "medium";
  let confidence = 0.75;

  if (lowerText.includes("overcharg") || lowerText.includes("too much") || lowerText.includes("extra money") || lowerText.includes("fare")) {
    category = "overcharging";
    severity = "medium";
    confidence = 0.85;
  } else if (lowerText.includes("refus") || lowerText.includes("denied") || lowerText.includes("won't take")) {
    category = "refusal_of_service";
    severity = "medium";
    confidence = 0.82;
  } else if (lowerText.includes("harass") || lowerText.includes("threat") || lowerText.includes("intimidat") || lowerText.includes("aggressive")) {
    category = "harassment";
    severity = "high";
    confidence = 0.88;
  } else if (lowerText.includes("unsafe") || lowerText.includes("reckless") || lowerText.includes("dangerous") || lowerText.includes("fast") || lowerText.includes("accident")) {
    category = "unsafe_driving";
    severity = "high";
    confidence = 0.84;
  } else if (lowerText.includes("meter") || lowerText.includes("tamper")) {
    category = "meter_tampering";
    severity = "high";
    confidence = 0.87;
  } else if (lowerText.includes("route") || lowerText.includes("longer") || lowerText.includes("detour") || lowerText.includes("wrong way")) {
    category = "route_deviation";
    severity = "low";
    confidence = 0.80;
  } else if (lowerText.includes("luggage") || lowerText.includes("bag") || lowerText.includes("suitcase")) {
    category = "luggage_issues";
    severity = "medium";
    confidence = 0.83;
  }

  // Sentiment: -1 (very negative) to 1 (positive). Complaints are mostly negative.
  const sentimentScore = -0.3 - Math.random() * 0.6;

  const summary = text.length > 120 ? text.substring(0, 120) + "..." : text;

  return { category, severity, confidence, summary, sentimentScore };
}

// POST: Submit a new complaint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = SubmitComplaintSchema.safeParse(body);

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

    const data = validation.data;
    const complaintNumber = generateComplaintNumber();

    // Mock AI categorization
    const aiResult = mockAICategorization(data.complaintText);

    try {
      // Upsert tourist by phone
      const tourist = await prisma.tourist.upsert({
        where: { phone: data.touristPhone },
        update: {
          fullName: data.touristName,
          ...(data.nationality && { nationality: data.nationality }),
          ...(data.touristEmail && { email: data.touristEmail }),
          preferredLang: data.preferredLanguage,
        },
        create: {
          fullName: data.touristName,
          phone: data.touristPhone,
          email: data.touristEmail || null,
          nationality: data.nationality || null,
          preferredLang: data.preferredLanguage,
        },
      });

      // Look up taxi permit by vehicle number if provided
      let taxiPermitId: string | null = null;
      if (data.vehicleNumber) {
        const permit = await prisma.taxiPermit.findFirst({
          where: { vehicleNumber: data.vehicleNumber },
        });
        if (permit) {
          taxiPermitId = permit.id;
          // Increment complaint count on permit
          await prisma.taxiPermit.update({
            where: { id: permit.id },
            data: { complaintCount: { increment: 1 } },
          });
        }
      }

      // Create complaint
      const complaint = await prisma.complaint.create({
        data: {
          complaintNumber,
          touristId: tourist.id,
          taxiPermitId,
          category: aiResult.category,
          severity: aiResult.severity,
          status: "open",
          originalText: data.complaintText,
          originalLanguage: data.preferredLanguage,
          aiCategoryConfidence: aiResult.confidence,
          aiSummary: aiResult.summary,
          aiSentimentScore: aiResult.sentimentScore,
          incidentLocation: data.incidentLocation || null,
          incidentDatetime: data.incidentDatetime ? new Date(data.incidentDatetime) : null,
          fareCharged: data.fareCharged || null,
          evidenceUrls: "[]",
        },
      });

      const trackingUrl = `/track/${complaintNumber}`;

      return NextResponse.json(
        {
          success: true,
          data: {
            complaintNumber: complaint.complaintNumber,
            status: complaint.status,
            category: complaint.category,
            severity: complaint.severity,
            trackingUrl,
            message: "Complaint registered successfully. A tourism officer will be assigned shortly.",
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      // Database not available — return mock response for demo
      console.error("Database error, returning mock response:", dbError);
      const trackingUrl = `/track/${complaintNumber}`;

      return NextResponse.json(
        {
          success: true,
          data: {
            complaintNumber,
            status: "open",
            category: aiResult.category,
            severity: aiResult.severity,
            trackingUrl,
            message: "Complaint registered successfully (demo mode). A tourism officer will be assigned shortly.",
            _demo: true,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Submit complaint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit complaint" },
      { status: 500 }
    );
  }
}

// GET: List complaints (paginated, filterable)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const search = searchParams.get("search");

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
      ];
    }

    try {
      const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
          where,
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
          },
          orderBy: { createdAt: "desc" },
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
    console.error("List complaints error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
