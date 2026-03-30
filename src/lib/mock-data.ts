import type { ComplaintWithDetails, DashboardStats, BlacklistEntry } from "@/types/complaint";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}
function minsAgo(n: number): string {
  return new Date(Date.now() - n * 60000).toISOString();
}

export const MOCK_OFFICERS = [
  { id: "off-1", name: "Inspector Ravi Naik", designation: "Inspector", zone: "Calangute", phone: "+91-98765-43210", dutyStatus: "on_duty" as const, activeCases: 3, resolutionRate: 92 },
  { id: "off-2", name: "SI Priya Desai", designation: "Sub-Inspector", zone: "Calangute", phone: "+91-98765-43211", dutyStatus: "on_duty" as const, activeCases: 2, resolutionRate: 88 },
  { id: "off-3", name: "Inspector Anthony Fernandes", designation: "Inspector", zone: "Panjim", phone: "+91-98765-43212", dutyStatus: "on_duty" as const, activeCases: 4, resolutionRate: 95 },
  { id: "off-4", name: "SI Maria D'Souza", designation: "Sub-Inspector", zone: "Panjim", phone: "+91-98765-43213", dutyStatus: "off_duty" as const, activeCases: 0, resolutionRate: 90 },
  { id: "off-5", name: "Inspector Suresh Gaonkar", designation: "Inspector", zone: "Margao", phone: "+91-98765-43214", dutyStatus: "on_duty" as const, activeCases: 2, resolutionRate: 87 },
  { id: "off-6", name: "TC Vinod Chodankar", designation: "Tourism Constable", zone: "Margao", phone: "+91-98765-43215", dutyStatus: "on_leave" as const, activeCases: 0, resolutionRate: 85 },
  { id: "off-7", name: "Inspector Elvis Gomes", designation: "Inspector", zone: "Vasco", phone: "+91-98765-43216", dutyStatus: "on_duty" as const, activeCases: 1, resolutionRate: 91 },
  { id: "off-8", name: "SI Nelson Pereira", designation: "Sub-Inspector", zone: "Vasco", phone: "+91-98765-43217", dutyStatus: "on_duty" as const, activeCases: 3, resolutionRate: 86 },
];

export const MOCK_PERMITS = [
  { id: "p-1", permitNumber: "GP-2024-0142", driverName: "Vinay Naik", vehicleNumber: "GA-01-T-4521", vehicleType: "sedan", zone: "Calangute", permitStatus: "active" as const, complaintCount: 7, expiryDate: "2026-12-31" },
  { id: "p-2", permitNumber: "GP-2024-0078", driverName: "Francis D'Souza", vehicleNumber: "GA-02-T-3890", vehicleType: "suv", zone: "Panjim", permitStatus: "active" as const, complaintCount: 5, expiryDate: "2026-09-15" },
  { id: "p-3", permitNumber: "GP-2024-0231", driverName: "Ravi Desai", vehicleNumber: "GA-03-T-1256", vehicleType: "sedan", zone: "Margao", permitStatus: "suspended" as const, complaintCount: 8, expiryDate: "2026-06-30" },
  { id: "p-4", permitNumber: "GP-2024-0312", driverName: "Anthony Fernandes", vehicleNumber: "GA-01-T-7823", vehicleType: "auto", zone: "Baga", permitStatus: "active" as const, complaintCount: 2, expiryDate: "2027-03-15" },
  { id: "p-5", permitNumber: "GP-2024-0089", driverName: "Suresh Gaonkar", vehicleNumber: "GA-04-T-5678", vehicleType: "sedan", zone: "Vasco", permitStatus: "active" as const, complaintCount: 0, expiryDate: "2026-11-30" },
  { id: "p-6", permitNumber: "GP-2024-0456", driverName: "Elvis Gomes", vehicleNumber: "GA-05-T-9012", vehicleType: "suv", zone: "Anjuna", permitStatus: "active" as const, complaintCount: 3, expiryDate: "2026-08-20" },
  { id: "p-7", permitNumber: "GP-2024-0567", driverName: "Prashant Chodankar", vehicleNumber: "GA-02-T-2345", vehicleType: "auto", zone: "Candolim", permitStatus: "active" as const, complaintCount: 1, expiryDate: "2027-01-10" },
  { id: "p-8", permitNumber: "GP-2024-0678", driverName: "Michael Rodrigues", vehicleNumber: "GA-06-T-6789", vehicleType: "sedan", zone: "Mapusa", permitStatus: "revoked" as const, complaintCount: 6, expiryDate: "2026-05-01" },
  { id: "p-9", permitNumber: "GP-2024-0789", driverName: "Deepak Prabhu", vehicleNumber: "GA-01-T-0123", vehicleType: "sedan", zone: "Calangute", permitStatus: "active" as const, complaintCount: 0, expiryDate: "2027-02-28" },
  { id: "p-10", permitNumber: "GP-2024-0890", driverName: "Ajay Shirodkar", vehicleNumber: "GA-03-T-4567", vehicleType: "auto", zone: "Margao", permitStatus: "active" as const, complaintCount: 4, expiryDate: "2026-10-15" },
  { id: "p-11", permitNumber: "GP-2024-0101", driverName: "Carlos Mascarenhas", vehicleNumber: "GA-07-T-8901", vehicleType: "suv", zone: "Panjim", permitStatus: "active" as const, complaintCount: 1, expiryDate: "2027-04-30" },
  { id: "p-12", permitNumber: "GP-2024-0202", driverName: "Santosh Chari", vehicleNumber: "GA-04-T-2346", vehicleType: "sedan", zone: "Vasco", permitStatus: "active" as const, complaintCount: 0, expiryDate: "2026-12-15" },
  { id: "p-13", permitNumber: "GP-2024-0303", driverName: "Bosco Menezes", vehicleNumber: "GA-08-T-5679", vehicleType: "auto", zone: "Baga", permitStatus: "active" as const, complaintCount: 2, expiryDate: "2027-01-31" },
  { id: "p-14", permitNumber: "GP-2024-0404", driverName: "Rajesh Sawant", vehicleNumber: "GA-01-T-9013", vehicleType: "sedan", zone: "Calangute", permitStatus: "active" as const, complaintCount: 5, expiryDate: "2026-07-15" },
  { id: "p-15", permitNumber: "GP-2024-0505", driverName: "Nelson Alvares", vehicleNumber: "GA-05-T-3457", vehicleType: "suv", zone: "Anjuna", permitStatus: "active" as const, complaintCount: 0, expiryDate: "2027-05-31" },
  { id: "p-16", permitNumber: "GP-2024-0606", driverName: "Ganesh Shet", vehicleNumber: "GA-02-T-7890", vehicleType: "auto", zone: "Candolim", permitStatus: "active" as const, complaintCount: 1, expiryDate: "2026-11-01" },
  { id: "p-17", permitNumber: "GP-2024-0707", driverName: "John Correia", vehicleNumber: "GA-06-T-1234", vehicleType: "sedan", zone: "Mapusa", permitStatus: "active" as const, complaintCount: 3, expiryDate: "2026-09-30" },
  { id: "p-18", permitNumber: "GP-2024-0808", driverName: "Anand Talaulikar", vehicleNumber: "GA-03-T-5680", vehicleType: "suv", zone: "Margao", permitStatus: "active" as const, complaintCount: 0, expiryDate: "2027-03-01" },
  { id: "p-19", permitNumber: "GP-2024-0909", driverName: "Pedro Furtado", vehicleNumber: "GA-07-T-9014", vehicleType: "auto", zone: "Panjim", permitStatus: "active" as const, complaintCount: 2, expiryDate: "2026-08-15" },
  { id: "p-20", permitNumber: "GP-2024-1010", driverName: "Manoj Parab", vehicleNumber: "GA-04-T-3458", vehicleType: "sedan", zone: "Vasco", permitStatus: "active" as const, complaintCount: 0, expiryDate: "2027-06-30" },
];

export const MOCK_COMPLAINTS: ComplaintWithDetails[] = [
  {
    id: "c-1", complaintNumber: "GOA-2026-00142", category: "overcharging", subcategory: "no_meter", severity: "high", status: "open",
    originalText: "Der Taxifahrer weigerte sich, das Taxameter zu benutzen, und verlangte 2000 Rupien für eine 15 km Fahrt vom Flughafen Dabolim nach Calangute.",
    originalLanguage: "de", translatedText: "The taxi driver refused to use the meter and demanded 2000 rupees for a 15km ride from Dabolim Airport to Calangute.",
    aiSummary: "German tourist overcharged ₹2000 for 15km airport-to-Calangute ride. Driver refused meter.", aiCategoryConfidence: 0.92,
    fareCharged: 2000, fareExpected: 750, incidentLocation: "Dabolim Airport → Calangute", incidentDatetime: minsAgo(45),
    createdAt: minsAgo(45), acknowledgedAt: null, resolvedAt: null,
    tourist: { fullName: "Hans Mueller", nationality: "German", phone: "+49-170-XXXX", preferredLang: "de" },
    taxiPermit: { permitNumber: "GP-2024-0142", driverName: "Vinay Naik", vehicleNumber: "GA-01-T-4521", zone: "Calangute", complaintCount: 7 },
    escalations: [{ id: "e-1", officerId: "off-1", status: "pending", priority: 2, assignedAt: minsAgo(44), officer: { name: "Inspector Ravi Naik", zone: "Calangute" } }],
  },
  {
    id: "c-2", complaintNumber: "GOA-2026-00143", category: "harassment", subcategory: "intimidation", severity: "critical", status: "investigating",
    originalText: "I was surrounded by 10+ aggressive taxi drivers at the airport. They blocked my path and one grabbed my luggage until I agreed to pay ₹1800 for a ride to Baga.",
    originalLanguage: "en", translatedText: null,
    aiSummary: "British tourist physically intimidated by group of drivers at airport. Luggage held hostage. Paid ₹1800 under duress.", aiCategoryConfidence: 0.95,
    fareCharged: 1800, fareExpected: 750, incidentLocation: "Dabolim Airport", incidentDatetime: hoursAgo(3),
    createdAt: hoursAgo(3), acknowledgedAt: hoursAgo(2.9), resolvedAt: null,
    tourist: { fullName: "James Thompson", nationality: "British", phone: "+44-7700-XXXX", preferredLang: "en" },
    taxiPermit: { permitNumber: "GP-2024-0078", driverName: "Francis D'Souza", vehicleNumber: "GA-02-T-3890", zone: "Panjim", complaintCount: 5 },
    escalations: [{ id: "e-2", officerId: "off-3", status: "in_progress", priority: 3, assignedAt: hoursAgo(2.8), officer: { name: "Inspector Anthony Fernandes", zone: "Panjim" } }],
  },
  {
    id: "c-3", complaintNumber: "GOA-2026-00144", category: "refusal_of_service", subcategory: null, severity: "medium", status: "acknowledged",
    originalText: "Водитель такси отказался включить счётчик и потребовал 2500 рупий за поездку из Панаджи в Калангут. Когда я отказался, он просто уехал.",
    originalLanguage: "ru", translatedText: "The taxi driver refused to turn on the meter and demanded 2500 rupees for a trip from Panjim to Calangute. When I refused, he just drove away.",
    aiSummary: "Russian tourist's ride refused after declining inflated fare of ₹2500 (Panjim to Calangute).", aiCategoryConfidence: 0.88,
    fareCharged: null, fareExpected: 400, incidentLocation: "Panjim Bus Stand", incidentDatetime: hoursAgo(5),
    createdAt: hoursAgo(5), acknowledgedAt: hoursAgo(4.9), resolvedAt: null,
    tourist: { fullName: "Alexei Petrov", nationality: "Russian", phone: "+7-916-XXXX", preferredLang: "ru" },
    taxiPermit: null, escalations: [],
  },
  {
    id: "c-4", complaintNumber: "GOA-2026-00145", category: "meter_tampering", subcategory: "rigged_meter", severity: "high", status: "escalated",
    originalText: "Le compteur du taxi augmentait beaucoup trop vite. Pour un trajet de 5 km, le compteur affichait 12 km. J'ai payé ₹800 au lieu d'environ ₹200.",
    originalLanguage: "fr", translatedText: "The taxi meter was running way too fast. For a 5km trip, the meter showed 12km. I paid ₹800 instead of about ₹200.",
    aiSummary: "French tourist victim of rigged meter — 5km trip showed 12km. Overcharged ₹600.", aiCategoryConfidence: 0.91,
    fareCharged: 800, fareExpected: 210, incidentLocation: "Baga Beach → Calangute", incidentDatetime: hoursAgo(8),
    createdAt: hoursAgo(8), acknowledgedAt: hoursAgo(7.9), resolvedAt: null,
    tourist: { fullName: "Pierre Dupont", nationality: "French", phone: "+33-6-XXXX", preferredLang: "fr" },
    taxiPermit: { permitNumber: "GP-2024-0231", driverName: "Ravi Desai", vehicleNumber: "GA-03-T-1256", zone: "Margao", complaintCount: 8 },
    escalations: [{ id: "e-4", officerId: "off-5", status: "accepted", priority: 2, assignedAt: hoursAgo(7.5), officer: { name: "Inspector Suresh Gaonkar", zone: "Margao" } }],
  },
  {
    id: "c-5", complaintNumber: "GOA-2026-00146", category: "overcharging", subcategory: "no_meter", severity: "medium", status: "open",
    originalText: "נהג המונית סירב להשתמש במונה ודרש 1500 רופי עבור נסיעה של 10 ק\"מ מאנג'ונה לבאגה. המחיר הנורמלי צריך להיות בערך 350 רופי.",
    originalLanguage: "he", translatedText: "The taxi driver refused to use the meter and demanded 1500 rupees for a 10km ride from Anjuna to Baga. The normal price should be about 350 rupees.",
    aiSummary: "Israeli tourist overcharged ₹1500 for 10km Anjuna-to-Baga ride (expected ~₹350). No meter used.", aiCategoryConfidence: 0.89,
    fareCharged: 1500, fareExpected: 350, incidentLocation: "Anjuna → Baga", incidentDatetime: minsAgo(20),
    createdAt: minsAgo(20), acknowledgedAt: null, resolvedAt: null,
    tourist: { fullName: "David Cohen", nationality: "Israeli", phone: "+972-50-XXXX", preferredLang: "he" },
    taxiPermit: { permitNumber: "GP-2024-0456", driverName: "Elvis Gomes", vehicleNumber: "GA-05-T-9012", zone: "Anjuna", complaintCount: 3 },
    escalations: [],
  },
  {
    id: "c-6", complaintNumber: "GOA-2026-00128", category: "unsafe_driving", subcategory: "reckless", severity: "high", status: "resolved",
    originalText: "The driver was driving extremely fast on the winding roads near Vagator. He was on his phone the entire time and nearly hit a motorcycle. I feared for my life.",
    originalLanguage: "en", translatedText: null,
    aiSummary: "Tourist reported reckless driving near Vagator — driver on phone, nearly caused accident.", aiCategoryConfidence: 0.93,
    fareCharged: 500, fareExpected: 400, incidentLocation: "Vagator Road", incidentDatetime: daysAgo(2),
    createdAt: daysAgo(2), acknowledgedAt: daysAgo(1.9), resolvedAt: daysAgo(1),
    tourist: { fullName: "Sarah Williams", nationality: "American", phone: "+1-555-XXXX", preferredLang: "en" },
    taxiPermit: { permitNumber: "GP-2024-0567", driverName: "Prashant Chodankar", vehicleNumber: "GA-02-T-2345", zone: "Candolim", complaintCount: 1 },
    escalations: [{ id: "e-6", officerId: "off-7", status: "completed", priority: 2, assignedAt: daysAgo(1.9), officer: { name: "Inspector Elvis Gomes", zone: "Vasco" } }],
  },
  {
    id: "c-7", complaintNumber: "GOA-2026-00135", category: "overcharging", subcategory: "inflated_fare", severity: "medium", status: "resolved",
    originalText: "Таксист потребовал 3000 рупий за поездку из аэропорта Даболим до Анджуны. Когда я сказал что слишком дорого, он стал кричать.",
    originalLanguage: "ru", translatedText: "The taxi driver demanded 3000 rupees for a trip from Dabolim airport to Anjuna. When I said it was too expensive, he started yelling.",
    aiSummary: "Russian tourist charged ₹3000 for airport-to-Anjuna (expected ~₹800). Driver became aggressive when challenged.", aiCategoryConfidence: 0.90,
    fareCharged: 3000, fareExpected: 800, incidentLocation: "Dabolim Airport → Anjuna", incidentDatetime: daysAgo(5),
    createdAt: daysAgo(5), acknowledgedAt: daysAgo(4.9), resolvedAt: daysAgo(3),
    tourist: { fullName: "Olga Ivanova", nationality: "Russian", phone: "+7-926-XXXX", preferredLang: "ru" },
    taxiPermit: { permitNumber: "GP-2024-0142", driverName: "Vinay Naik", vehicleNumber: "GA-01-T-4521", zone: "Calangute", complaintCount: 7 },
    escalations: [{ id: "e-7", officerId: "off-1", status: "completed", priority: 1, assignedAt: daysAgo(4.8), officer: { name: "Inspector Ravi Naik", zone: "Calangute" } }],
  },
  {
    id: "c-8", complaintNumber: "GOA-2026-00118", category: "route_deviation", subcategory: null, severity: "low", status: "closed",
    originalText: "Le chauffeur a pris un détour inutile pour aller de l'aéroport à Panjim, rallongeant le trajet de 20 minutes.",
    originalLanguage: "fr", translatedText: "The driver took an unnecessary detour from the airport to Panjim, extending the trip by 20 minutes.",
    aiSummary: "French tourist reported unnecessary route deviation from airport to Panjim (+20 min).", aiCategoryConfidence: 0.82,
    fareCharged: 1200, fareExpected: 900, incidentLocation: "Dabolim Airport → Panjim", incidentDatetime: daysAgo(8),
    createdAt: daysAgo(8), acknowledgedAt: daysAgo(7.9), resolvedAt: daysAgo(6),
    tourist: { fullName: "Marie Laurent", nationality: "French", phone: "+33-7-XXXX", preferredLang: "fr" },
    taxiPermit: { permitNumber: "GP-2024-0101", driverName: "Carlos Mascarenhas", vehicleNumber: "GA-07-T-8901", zone: "Panjim", complaintCount: 1 },
    escalations: [{ id: "e-8", officerId: "off-3", status: "completed", priority: 1, assignedAt: daysAgo(7.8), officer: { name: "Inspector Anthony Fernandes", zone: "Panjim" } }],
  },
  {
    id: "c-9", complaintNumber: "GOA-2026-00110", category: "luggage_issues", subcategory: "held_hostage", severity: "high", status: "resolved",
    originalText: "Der Fahrer hat meinen Koffer im Kofferraum eingesperrt und wollte ihn nicht herausgeben, bis ich 500 Rupien extra bezahlt habe.",
    originalLanguage: "de", translatedText: "The driver locked my suitcase in the trunk and refused to return it until I paid 500 rupees extra.",
    aiSummary: "German tourist's luggage held hostage — driver demanded ₹500 extra to release suitcase from trunk.", aiCategoryConfidence: 0.94,
    fareCharged: 1200, fareExpected: 700, incidentLocation: "Calangute Beach Road", incidentDatetime: daysAgo(3),
    createdAt: daysAgo(3), acknowledgedAt: daysAgo(2.95), resolvedAt: daysAgo(1.5),
    tourist: { fullName: "Klaus Wagner", nationality: "German", phone: "+49-151-XXXX", preferredLang: "de" },
    taxiPermit: { permitNumber: "GP-2024-0678", driverName: "Michael Rodrigues", vehicleNumber: "GA-06-T-6789", zone: "Mapusa", complaintCount: 6 },
    escalations: [{ id: "e-9", officerId: "off-1", status: "completed", priority: 2, assignedAt: daysAgo(2.9), officer: { name: "Inspector Ravi Naik", zone: "Calangute" } }],
  },
  {
    id: "c-10", complaintNumber: "GOA-2026-00105", category: "overcharging", subcategory: "no_meter", severity: "medium", status: "closed",
    originalText: "Taxi from Margao station to Colva beach charged ₹600. Other tourists told me it should be about ₹200.",
    originalLanguage: "en", translatedText: null,
    aiSummary: "Overcharged ₹600 for Margao-to-Colva (expected ~₹200). No meter.", aiCategoryConfidence: 0.87,
    fareCharged: 600, fareExpected: 200, incidentLocation: "Margao Station → Colva Beach", incidentDatetime: daysAgo(12),
    createdAt: daysAgo(12), acknowledgedAt: daysAgo(11.9), resolvedAt: daysAgo(10),
    tourist: { fullName: "Anna Kowalski", nationality: "Polish", phone: "+48-512-XXXX", preferredLang: "en" },
    taxiPermit: { permitNumber: "GP-2024-0303", driverName: "Bosco Menezes", vehicleNumber: "GA-08-T-5679", zone: "Baga", complaintCount: 2 },
    escalations: [{ id: "e-10", officerId: "off-5", status: "completed", priority: 1, assignedAt: daysAgo(11.8), officer: { name: "Inspector Suresh Gaonkar", zone: "Margao" } }],
  },
];

export const MOCK_BLACKLIST: BlacklistEntry[] = [
  {
    id: "bl-1", taxiPermitId: "p-3", reason: "8 complaints in 60 days — overcharging, meter tampering, harassment",
    totalComplaints: 8, blacklistedAt: daysAgo(7), status: "active",
    taxiPermit: { permitNumber: "GP-2024-0231", driverName: "Ravi Desai", vehicleNumber: "GA-03-T-1256", zone: "Margao" },
  },
  {
    id: "bl-2", taxiPermitId: "p-1", reason: "7 complaints in 45 days — repeat overcharging at airport",
    totalComplaints: 7, blacklistedAt: daysAgo(3), status: "active",
    taxiPermit: { permitNumber: "GP-2024-0142", driverName: "Vinay Naik", vehicleNumber: "GA-01-T-4521", zone: "Calangute" },
  },
  {
    id: "bl-3", taxiPermitId: "p-8", reason: "6 complaints — luggage hostage, verbal abuse, overcharging",
    totalComplaints: 6, blacklistedAt: daysAgo(14), status: "active",
    taxiPermit: { permitNumber: "GP-2024-0678", driverName: "Michael Rodrigues", vehicleNumber: "GA-06-T-6789", zone: "Mapusa" },
  },
  {
    id: "bl-4", taxiPermitId: "p-14", reason: "5 complaints in 30 days — systematic overcharging in Calangute zone",
    totalComplaints: 5, blacklistedAt: daysAgo(10), status: "under_review",
    taxiPermit: { permitNumber: "GP-2024-0404", driverName: "Rajesh Sawant", vehicleNumber: "GA-01-T-9013", zone: "Calangute" },
  },
  {
    id: "bl-5", taxiPermitId: "p-2", reason: "5 complaints — harassment and intimidation at Dabolim Airport",
    totalComplaints: 5, blacklistedAt: daysAgo(5), status: "active",
    taxiPermit: { permitNumber: "GP-2024-0078", driverName: "Francis D'Souza", vehicleNumber: "GA-02-T-3890", zone: "Panjim" },
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  openCases: 12,
  inProgress: 8,
  slaBreaches: 3,
  todayTotal: 5,
  resolvedToday: 2,
  avgResolutionHours: 4.2,
  slaComplianceRate: 87.5,
  totalComplaints: 156,
};

export const MOCK_ANALYTICS = {
  dailyTrend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
    count: [3, 5, 4, 7, 6, 2, 3, 5, 8, 4, 6, 3, 5, 7, 4, 6, 3, 5, 8, 6, 4, 7, 5, 3, 6, 4, 5, 7, 6, 5][i],
  })),
  categoryBreakdown: [
    { category: "overcharging", count: 62 },
    { category: "harassment", count: 24 },
    { category: "refusal_of_service", count: 23 },
    { category: "unsafe_driving", count: 16 },
    { category: "meter_tampering", count: 12 },
    { category: "route_deviation", count: 9 },
    { category: "luggage_issues", count: 6 },
    { category: "other", count: 4 },
  ],
  severityBreakdown: [
    { severity: "low", count: 39 },
    { severity: "medium", count: 62 },
    { severity: "high", count: 39 },
    { severity: "critical", count: 16 },
  ],
  zoneDistribution: [
    { zone: "Calangute", count: 38 },
    { zone: "Dabolim Airport", count: 28 },
    { zone: "Baga", count: 22 },
    { zone: "Panjim", count: 20 },
    { zone: "Anjuna", count: 18 },
    { zone: "Margao", count: 14 },
    { zone: "Candolim", count: 9 },
    { zone: "Vasco", count: 7 },
  ],
  topOffenders: [
    { vehicleNumber: "GA-03-T-1256", driverName: "Ravi Desai", count: 8 },
    { vehicleNumber: "GA-01-T-4521", driverName: "Vinay Naik", count: 7 },
    { vehicleNumber: "GA-06-T-6789", driverName: "Michael Rodrigues", count: 6 },
    { vehicleNumber: "GA-02-T-3890", driverName: "Francis D'Souza", count: 5 },
    { vehicleNumber: "GA-01-T-9013", driverName: "Rajesh Sawant", count: 5 },
    { vehicleNumber: "GA-03-T-4567", driverName: "Ajay Shirodkar", count: 4 },
    { vehicleNumber: "GA-05-T-9012", driverName: "Elvis Gomes", count: 3 },
    { vehicleNumber: "GA-06-T-1234", driverName: "John Correia", count: 3 },
  ],
  nationalityBreakdown: [
    { nationality: "Russian", count: 32 },
    { nationality: "British", count: 28 },
    { nationality: "German", count: 24 },
    { nationality: "Israeli", count: 18 },
    { nationality: "French", count: 16 },
    { nationality: "American", count: 14 },
    { nationality: "Australian", count: 10 },
    { nationality: "Polish", count: 8 },
    { nationality: "Other", count: 6 },
  ],
  slaCompliance: { within60s: 128, within120s: 18, breached: 10 },
};
