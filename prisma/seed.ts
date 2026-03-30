import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(
    Math.floor(Math.random() * 14) + 7, // 07:00-21:00
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
    0
  );
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function complaintNumber(index: number): string {
  return `GOA-2026-${String(10001 + index).padStart(5, "0")}`;
}

function cuid(): string {
  // lightweight pseudo-cuid for seeding
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `cl${ts}${rand}`;
}

// ---------------------------------------------------------------------------
// Static Data Definitions
// ---------------------------------------------------------------------------

const ZONES = [
  "Calangute",
  "Panjim",
  "Margao",
  "Vasco",
  "Anjuna",
  "Baga",
  "Candolim",
  "Mapusa",
];

const CATEGORIES = [
  "overcharging",
  "harassment",
  "refusal_of_service",
  "unsafe_driving",
  "meter_tampering",
  "route_deviation",
  "luggage_issues",
  "other",
];
const CATEGORY_WEIGHTS = [40, 15, 15, 10, 8, 5, 4, 3];

const SEVERITIES = ["critical", "high", "medium", "low"];
const SEVERITY_WEIGHTS = [5, 20, 50, 25];

const STATUSES = [
  "open",
  "acknowledged",
  "investigating",
  "escalated",
  "resolved",
  "closed",
];
const STATUS_WEIGHTS = [15, 10, 20, 5, 30, 20];

const LANGUAGES = ["en", "ru", "de", "fr", "he"];
const LANG_WEIGHTS = [40, 20, 15, 15, 10];

const NATIONALITIES: Record<string, string[]> = {
  en: ["British", "American", "Australian"],
  ru: ["Russian", "Russian", "Ukrainian"],
  de: ["German", "Austrian", "Swiss"],
  fr: ["French", "Belgian", "Canadian"],
  he: ["Israeli", "Israeli"],
};

const LOCATIONS = [
  "Dabolim Airport",
  "Calangute Beach",
  "Baga Beach",
  "Anjuna Beach",
  "Panjim City Center",
  "Mapusa Market",
  "Margao Railway Station",
  "Vasco Bus Stand",
  "Candolim Beach Road",
  "Vagator Beach",
  "Colva Beach",
  "Old Goa Church",
  "Dona Paula Jetty",
  "Fort Aguada",
  "Palolem Beach",
  "Chapora Fort",
  "Dudhsagar Falls Entrance",
  "Miramar Beach",
];

// Lat/Lng approximate centers for zones
const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  Calangute: { lat: 15.5449, lng: 73.7554 },
  Panjim: { lat: 15.4909, lng: 73.8278 },
  Margao: { lat: 15.2832, lng: 73.9862 },
  Vasco: { lat: 15.3982, lng: 73.8113 },
  Anjuna: { lat: 15.5735, lng: 73.7413 },
  Baga: { lat: 15.5567, lng: 73.7513 },
  Candolim: { lat: 15.5152, lng: 73.7621 },
  Mapusa: { lat: 15.5922, lng: 73.8089 },
};

// ---------------------------------------------------------------------------
// 50 Taxi Permits
// ---------------------------------------------------------------------------

interface PermitDef {
  driverName: string;
  zone: string;
  vehicleType: string;
  permitStatus: string;
  complaintCount: number;
}

const PERMITS: PermitDef[] = [
  // Problem drivers
  { driverName: "Vinay Naik", zone: "Calangute", vehicleType: "sedan", permitStatus: "active", complaintCount: 7 },
  { driverName: "Ravi Desai", zone: "Baga", vehicleType: "suv", permitStatus: "suspended", complaintCount: 8 },
  { driverName: "Michael Rodrigues", zone: "Anjuna", vehicleType: "sedan", permitStatus: "active", complaintCount: 6 },
  { driverName: "Francis D'Souza", zone: "Panjim", vehicleType: "sedan", permitStatus: "suspended", complaintCount: 5 },
  { driverName: "Rajesh Sawant", zone: "Vasco", vehicleType: "suv", permitStatus: "active", complaintCount: 5 },
  // Regular drivers
  { driverName: "Anthony Fernandes", zone: "Panjim", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Suresh Gaonkar", zone: "Margao", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Prashant Chodankar", zone: "Margao", vehicleType: "sedan", permitStatus: "active", complaintCount: 0 },
  { driverName: "Elvis Gomes", zone: "Vasco", vehicleType: "suv", permitStatus: "active", complaintCount: 3 },
  { driverName: "Deepak Prabhu", zone: "Calangute", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Ajay Shirodkar", zone: "Candolim", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Carlos Mascarenhas", zone: "Baga", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Santosh Chari", zone: "Mapusa", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Bosco Menezes", zone: "Anjuna", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Nelson Alvares", zone: "Panjim", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Ganesh Shet", zone: "Calangute", vehicleType: "sedan", permitStatus: "active", complaintCount: 1 },
  { driverName: "John Correia", zone: "Vasco", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Anand Talaulikar", zone: "Margao", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Pedro Furtado", zone: "Panjim", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Manoj Parab", zone: "Baga", vehicleType: "sedan", permitStatus: "active", complaintCount: 1 },
  { driverName: "Sandeep Naik", zone: "Calangute", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Xavier Dias", zone: "Candolim", vehicleType: "sedan", permitStatus: "active", complaintCount: 1 },
  { driverName: "Ramesh Lotlikar", zone: "Mapusa", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Benedict Lobo", zone: "Anjuna", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Govind Parsekar", zone: "Margao", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Dominic Fernandes", zone: "Vasco", vehicleType: "sedan", permitStatus: "suspended", complaintCount: 4 },
  { driverName: "Vikram Naik", zone: "Calangute", vehicleType: "suv", permitStatus: "active", complaintCount: 1 },
  { driverName: "Alban Rodrigues", zone: "Baga", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Nilesh Gaonkar", zone: "Mapusa", vehicleType: "sedan", permitStatus: "active", complaintCount: 1 },
  { driverName: "Cajetan Vaz", zone: "Panjim", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Umesh Desai", zone: "Candolim", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Floyd Cardozo", zone: "Anjuna", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Rohan Prabhudesai", zone: "Margao", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Agnel Pereira", zone: "Vasco", vehicleType: "sedan", permitStatus: "active", complaintCount: 0 },
  { driverName: "Savio D'Costa", zone: "Calangute", vehicleType: "sedan", permitStatus: "revoked", complaintCount: 3 },
  { driverName: "Prakash Naik", zone: "Baga", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Milind Kerkar", zone: "Mapusa", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Wilson Mendes", zone: "Panjim", vehicleType: "sedan", permitStatus: "active", complaintCount: 1 },
  { driverName: "Nishant Shirodkar", zone: "Candolim", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Joaquim Braganza", zone: "Anjuna", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Dayanand Naik", zone: "Margao", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Leo Monteiro", zone: "Vasco", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Tushar Desai", zone: "Calangute", vehicleType: "sedan", permitStatus: "active", complaintCount: 0 },
  { driverName: "Cedric Soares", zone: "Baga", vehicleType: "sedan", permitStatus: "revoked", complaintCount: 3 },
  { driverName: "Ashwin Gaude", zone: "Mapusa", vehicleType: "auto", permitStatus: "active", complaintCount: 1 },
  { driverName: "Ricardo Fernandes", zone: "Panjim", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
  { driverName: "Hemant Chari", zone: "Candolim", vehicleType: "sedan", permitStatus: "active", complaintCount: 1 },
  { driverName: "Patrick D'Mello", zone: "Anjuna", vehicleType: "auto", permitStatus: "active", complaintCount: 0 },
  { driverName: "Shailesh Rane", zone: "Margao", vehicleType: "sedan", permitStatus: "active", complaintCount: 2 },
  { driverName: "Augustine Pinto", zone: "Vasco", vehicleType: "suv", permitStatus: "active", complaintCount: 0 },
];

// ---------------------------------------------------------------------------
// 8 Tourism Officers
// ---------------------------------------------------------------------------

interface OfficerDef {
  name: string;
  designation: string;
  zone: string;
  dutyStatus: string;
  phone: string;
  email: string;
}

const OFFICERS: OfficerDef[] = [
  { name: "Inspector Ravi Naik", designation: "Inspector", zone: "Calangute", dutyStatus: "on_duty", phone: "+919876543201", email: "ravi.naik@goatourism.gov.in" },
  { name: "SI Priya Desai", designation: "Sub-Inspector", zone: "Calangute", dutyStatus: "on_duty", phone: "+919876543202", email: "priya.desai@goatourism.gov.in" },
  { name: "Inspector Anthony Fernandes", designation: "Inspector", zone: "Panjim", dutyStatus: "on_duty", phone: "+919876543203", email: "anthony.f@goatourism.gov.in" },
  { name: "SI Maria D'Souza", designation: "Sub-Inspector", zone: "Panjim", dutyStatus: "off_duty", phone: "+919876543204", email: "maria.dsouza@goatourism.gov.in" },
  { name: "Inspector Suresh Gaonkar", designation: "Inspector", zone: "Margao", dutyStatus: "on_duty", phone: "+919876543205", email: "suresh.g@goatourism.gov.in" },
  { name: "TC Vinod Chodankar", designation: "Tourism Constable", zone: "Margao", dutyStatus: "on_leave", phone: "+919876543206", email: "vinod.c@goatourism.gov.in" },
  { name: "Inspector Elvis Gomes", designation: "Inspector", zone: "Vasco", dutyStatus: "on_duty", phone: "+919876543207", email: "elvis.g@goatourism.gov.in" },
  { name: "SI Nelson Pereira", designation: "Sub-Inspector", zone: "Vasco", dutyStatus: "off_duty", phone: "+919876543208", email: "nelson.p@goatourism.gov.in" },
];

// ---------------------------------------------------------------------------
// Complaint text templates per language
// ---------------------------------------------------------------------------

const COMPLAINT_TEXTS: Record<string, string[]> = {
  en: [
    "The taxi driver at Dabolim Airport refused to use the meter and demanded {fare} for a ride to {loc}. The fair price should be around {expected}.",
    "Driver became very aggressive when I tried to negotiate the fare from {loc} to {loc2}. He surrounded me with other taxi drivers and I felt very intimidated and unsafe.",
    "The taxi meter was clearly tampered with. It showed 25km for what Google Maps confirmed was only 10km from {loc} to {loc2}.",
    "Driver took an unnecessarily long route from {loc} to {loc2}. What should have been a 20-minute ride turned into 45 minutes.",
    "The driver was texting while driving on the highway near {loc} and nearly caused an accident. Very reckless driving at high speed.",
    "My taxi driver demanded {fare} for a short ride from {loc} to {loc2}. When I refused, he started yelling at me in front of other tourists.",
    "The driver refused to take me from {loc} to {loc2} because he said the distance was too short. I was stranded with heavy luggage.",
    "Driver held my luggage hostage in the trunk and refused to give it back until I paid {fare} instead of the metered {expected}.",
    "Taxi from {loc} to {loc2} charged {fare} but the actual distance was only 8km. The meter must have been rigged.",
    "The driver drove extremely recklessly through narrow roads near {loc}, nearly hitting pedestrians. I feared for my life.",
    "After arriving at {loc2}, the driver demanded an extra {fare} for my two suitcases. This was never mentioned before the ride.",
    "The driver from {loc} to {loc2} kept stopping to pick up other passengers without my consent, making the journey three times longer.",
    "I was overcharged {fare} for a ride from Dabolim Airport to {loc2}. Other tourists on the same flight paid only {expected} for the same destination.",
    "The taxi driver near {loc} refused to turn on the AC despite the 38-degree heat, then charged me the full AC rate of {fare}.",
    "Driver took a detour through back roads from {loc} to {loc2}, adding 15km to what should have been a straightforward coastal route.",
  ],
  ru: [
    "Водитель такси отказался включить счётчик и потребовал {fare} рупий за поездку из {loc} в {loc2}. Это грабёж.",
    "Таксист потребовал {fare} рупий за поездку из аэропорта Даболим до {loc2}. Когда я сказал что дорого, он стал кричать и угрожать.",
    "Водитель ехал очень быстро и разговаривал по телефону всю дорогу от {loc} до {loc2}. Я чувствовал себя в опасности.",
    "Счётчик такси явно подделан. За поездку из {loc} в {loc2} (около 8 км) счётчик показал 22 км и {fare} рупий.",
    "Водитель отказался везти нас из {loc} в {loc2}, сказав что слишком далеко. Мы были вынуждены искать другое такси под палящим солнцем.",
    "Таксист удерживал наш багаж и требовал {fare} рупий вместо {expected}. Пришлось заплатить чтобы получить чемоданы обратно.",
    "Водитель вёз нас из {loc} в {loc2} по очень длинному маршруту. Поездка заняла час вместо обычных 20 минут.",
    "Водитель такси из {loc} был очень груб и кричал когда мы попросили включить кондиционер. Потребовал {fare} рупий за короткую поездку.",
  ],
  de: [
    "Der Taxifahrer weigerte sich, das Taxameter zu benutzen, und verlangte {fare} Rupien fuer eine 15km Fahrt von {loc} nach {loc2}.",
    "Der Fahrer hat meinen Koffer im Kofferraum eingesperrt und wollte ihn erst herausgeben, nachdem ich {fare} statt {expected} Rupien bezahlt habe.",
    "Der Fahrer fuhr extrem schnell auf den kurvigen Strassen bei {loc}. Ich hatte Angst um mein Leben.",
    "Fuer die Fahrt von {loc} nach {loc2} wurden {fare} Rupien verlangt. Andere Touristen zahlten nur {expected} fuer dieselbe Strecke.",
    "Der Taxameter war offensichtlich manipuliert. Fuer 10km von {loc} nach {loc2} zeigte er 28km an.",
    "Der Fahrer nahm einen Umweg von {loc} nach {loc2} und die Fahrt dauerte 50 Minuten statt der ueblichen 20 Minuten.",
    "Der Taxifahrer bei {loc} war sehr aggressiv als ich den Preis von {fare} Rupien hinterfragte. Er schrie mich an vor anderen Touristen.",
  ],
  fr: [
    "Le chauffeur de taxi a refuse d'utiliser le compteur et a exige {fare} roupies pour un trajet de {loc} a {loc2}.",
    "Le compteur du taxi augmentait beaucoup trop vite. Pour un trajet de 5km de {loc} a {loc2}, le compteur affichait 12km et {fare} roupies.",
    "Le chauffeur conduisait tres dangereusement sur la route de {loc} a {loc2}, depassant des camions dans les virages.",
    "J'ai ete surfacture de {fare} roupies pour un trajet depuis l'aeroport de Dabolim jusqu'a {loc2}. Le prix normal est de {expected} roupies.",
    "Le chauffeur a refuse de me prendre de {loc} a {loc2} parce que c'etait trop court. Il a ete tres impoli.",
    "Le chauffeur a retenu mes bagages et a demande {fare} roupies au lieu de {expected}. J'ai du appeler la police.",
    "Le taxi a fait un detour inutile de {loc} a {loc2}. Le trajet devait durer 15 minutes mais a pris 40 minutes.",
  ],
  he: [
    "נהג המונית סירב להשתמש במונה ודרש {fare} רופי עבור נסיעה של 10 ק\"מ מ{loc} ל{loc2}.",
    "הנהג נהג מהר מאוד ודיבר בטלפון כל הדרך מ{loc} ל{loc2}. הרגשתי בסכנה גדולה.",
    "המונה היה מזויף בבירור. עבור נסיעה של 8 ק\"מ מ{loc} ל{loc2} הוא הראה 20 ק\"מ.",
    "הנהג דרש {fare} רופי עבור נסיעה קצרה. כשסירבתי, הוא צעק עליי והפחיד אותי.",
    "הנהג סירב לקחת אותי מ{loc} ל{loc2} כי אמר שזה קרוב מדי. הייתי תקוע עם מזוודות.",
  ],
};

const AI_SUMMARIES: Record<string, string[]> = {
  overcharging: [
    "Tourist reports being charged {fare} for a route that should cost approximately {expected}. Fare exceeds expected by {pct}%.",
    "Driver demanded inflated fare of {fare} without using meter. Expected fare for this route is {expected}.",
    "Significant overcharging incident. Tourist paid {fare} versus estimated fair fare of {expected}.",
  ],
  harassment: [
    "Tourist reports aggressive behavior from driver including verbal intimidation and threatening body language.",
    "Driver became hostile when tourist questioned fare. Multiple drivers surrounded the tourist.",
    "Verbal abuse and aggressive behavior reported. Tourist felt unsafe and intimidated.",
  ],
  refusal_of_service: [
    "Driver refused to transport tourist citing short distance. Tourist stranded with luggage.",
    "Taxi driver refused ride to requested destination. No valid reason provided.",
    "Service refusal reported. Driver would not accept passenger for the requested route.",
  ],
  unsafe_driving: [
    "Tourist reports dangerous driving behavior including speeding and phone use while driving.",
    "Reckless driving reported on highway. Driver exceeded safe speed limits and used phone.",
    "Extremely dangerous driving through narrow roads. Near-miss with pedestrians reported.",
  ],
  meter_tampering: [
    "Taxi meter showing inflated distance. Actual distance {expected_km}km, meter showed {meter_km}km.",
    "Clear evidence of meter manipulation. Fare calculated on false distance reading.",
    "Tampered meter detected. Distance discrepancy of over 100% between actual and displayed.",
  ],
  route_deviation: [
    "Driver took unnecessarily long route, extending journey time from 20 to 45+ minutes.",
    "Significant detour through back roads added extra distance and time to the trip.",
    "Route deviation reported. Standard route bypassed in favor of longer alternative.",
  ],
  luggage_issues: [
    "Driver held luggage hostage until inflated fare was paid. Tourist coerced into paying.",
    "Baggage dispute — driver demanded extra payment for standard luggage.",
    "Tourist's belongings held in vehicle trunk until additional unauthorized charges were paid.",
  ],
  other: [
    "General complaint about taxi service quality in the area.",
    "Tourist reports unsatisfactory experience that doesn't fit standard categories.",
    "Miscellaneous complaint regarding taxi driver conduct.",
  ],
};

// SMS templates per language
const SMS_TEMPLATES: Record<string, string> = {
  en: "[GoaSafe] Complaint #{number} registered. A tourism officer will contact you within 4 hours. Track: https://goasafe.goa.gov.in/track/{number} Helpline: 1800-233-7333",
  ru: "[GoaSafe] Жалоба #{number} зарегистрирована. Сотрудник туризма свяжется с вами в течение 4 часов. Статус: https://goasafe.goa.gov.in/track/{number}",
  de: "[GoaSafe] Beschwerde #{number} registriert. Ein Tourismusbeamter wird Sie innerhalb von 4 Stunden kontaktieren. Status: https://goasafe.goa.gov.in/track/{number}",
  fr: "[GoaSafe] Plainte #{number} enregistree. Un agent du tourisme vous contactera dans les 4 heures. Suivi: https://goasafe.goa.gov.in/track/{number}",
  he: "[GoaSafe] תלונה #{number} נרשמה. פקיד תיירות ייצור איתך קשר תוך 4 שעות. מצב: https://goasafe.goa.gov.in/track/{number}",
};

// Tourist name pools per language
const TOURIST_NAMES: Record<string, string[]> = {
  en: [
    "James Thompson", "Sarah Williams", "David Brown", "Emily Clarke", "Robert Miller",
    "Jessica Taylor", "William Harris", "Amanda Scott", "Thomas Wright", "Laura King",
    "Matthew Cooper", "Rachel Green", "Daniel White", "Olivia Johnson", "Andrew Martin",
  ],
  ru: [
    "Алексей Петров", "Мария Иванова", "Дмитрий Козлов", "Елена Смирнова", "Сергей Волков",
    "Анна Новикова", "Иван Морозов", "Наталья Соколова", "Андрей Попов", "Ольга Лебедева",
  ],
  de: [
    "Hans Mueller", "Petra Schmidt", "Klaus Weber", "Ingrid Fischer", "Stefan Wagner",
    "Monika Becker", "Thomas Schulz", "Helga Hoffmann", "Markus Bauer", "Sabine Koch",
  ],
  fr: [
    "Pierre Dupont", "Marie Laurent", "Jean Martin", "Sophie Bernard", "Michel Dubois",
    "Claire Moreau", "Luc Lefevre", "Isabelle Roux", "Philippe Simon", "Nathalie Girard",
  ],
  he: [
    "David Cohen", "Noa Levy", "Yossi Mizrahi", "Tamar Friedman", "Avi Ben-David",
    "Shira Goldberg", "Eyal Shapira", "Michal Rosenberg", "Oren Katz", "Hila Avraham",
  ],
};

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log("Cleaning existing data...");

  // Delete in correct order for foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.smsLog.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.blacklist.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.tourist.deleteMany();
  await prisma.tourismOfficer.deleteMany();
  await prisma.taxiPermit.deleteMany();

  console.log("All existing data cleared.\n");

  // -----------------------------------------------------------------------
  // 1. Seed Taxi Permits (50)
  // -----------------------------------------------------------------------

  const permitRecords = PERMITS.map((p, i) => {
    const zoneCode = String((i % 8) + 1).padStart(2, "0");
    const vehicleNum = `GA-${zoneCode}-T-${String(1001 + i).padStart(4, "0")}`;
    const permitNum = `GOA/TAXI/${String(2024)}/${String(5001 + i)}`;
    const issuedDate = new Date("2023-01-15");
    issuedDate.setDate(issuedDate.getDate() + randomBetween(0, 365));
    const expiryDate = new Date(issuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    return {
      id: `permit_${String(i + 1).padStart(3, "0")}`,
      permitNumber: permitNum,
      driverName: p.driverName,
      driverPhone: `+91${9800000000 + randomBetween(1000, 99999)}`,
      vehicleNumber: vehicleNum,
      vehicleType: p.vehicleType,
      permitStatus: p.permitStatus,
      zone: p.zone,
      issuedDate,
      expiryDate,
      complaintCount: p.complaintCount,
    };
  });

  for (const p of permitRecords) {
    await prisma.taxiPermit.create({ data: p });
  }
  console.log(`Seeded ${permitRecords.length} taxi permits.`);

  // -----------------------------------------------------------------------
  // 2. Seed Tourism Officers (8)
  // -----------------------------------------------------------------------

  const officerRecords = OFFICERS.map((o, i) => {
    const coords = ZONE_COORDS[o.zone];
    return {
      id: `officer_${String(i + 1).padStart(3, "0")}`,
      name: o.name,
      designation: o.designation,
      phone: o.phone,
      email: o.email,
      zone: o.zone,
      isActive: o.dutyStatus !== "on_leave",
      dutyStatus: o.dutyStatus,
      currentLat: coords.lat + randomFloat(-0.01, 0.01),
      currentLng: coords.lng + randomFloat(-0.01, 0.01),
      lastLocationUpdate: daysAgo(0),
    };
  });

  for (const o of officerRecords) {
    await prisma.tourismOfficer.create({ data: o });
  }
  console.log(`Seeded ${officerRecords.length} tourism officers.`);

  // -----------------------------------------------------------------------
  // 3. Seed Tourists (100 — one per complaint)
  // -----------------------------------------------------------------------

  const touristRecords: Array<{
    id: string;
    fullName: string;
    nationality: string;
    phone: string;
    email: string;
    preferredLang: string;
  }> = [];

  for (let i = 0; i < 100; i++) {
    const lang = pickWeighted(LANGUAGES, LANG_WEIGHTS);
    const names = TOURIST_NAMES[lang];
    const name = names[i % names.length];
    const nationality = pick(NATIONALITIES[lang]);
    const phoneBase = lang === "ru" ? "+7900" : lang === "de" ? "+4915" : lang === "fr" ? "+336" : lang === "he" ? "+9725" : "+44";
    const phone = `${phoneBase}${String(randomBetween(1000000, 9999999))}`;

    touristRecords.push({
      id: `tourist_${String(i + 1).padStart(3, "0")}`,
      fullName: name + (i >= names.length ? ` ${String.fromCharCode(65 + Math.floor(i / names.length))}.` : ""),
      nationality,
      phone,
      email: `${name.toLowerCase().replace(/[^a-z]/g, "").substring(0, 8)}${i}@${lang === "ru" ? "yandex.ru" : lang === "de" ? "web.de" : lang === "fr" ? "orange.fr" : lang === "he" ? "walla.co.il" : "gmail.com"}`,
      preferredLang: lang,
    });
  }

  for (const t of touristRecords) {
    await prisma.tourist.create({ data: t });
  }
  console.log(`Seeded ${touristRecords.length} tourists.`);

  // -----------------------------------------------------------------------
  // 4. Seed Complaints (100)
  // -----------------------------------------------------------------------

  // Problem driver IDs for weighted assignment
  const problemPermitIds = permitRecords.filter((p) => p.complaintCount >= 5).map((p) => p.id);
  const regularPermitIds = permitRecords.filter((p) => p.complaintCount < 5 && p.complaintCount > 0).map((p) => p.id);
  const cleanPermitIds = permitRecords.filter((p) => p.complaintCount === 0).map((p) => p.id);

  function pickPermitId(): string {
    // Weight toward problem drivers
    const r = Math.random();
    if (r < 0.45 && problemPermitIds.length) return pick(problemPermitIds);
    if (r < 0.75 && regularPermitIds.length) return pick(regularPermitIds);
    return pick(cleanPermitIds.length ? cleanPermitIds : regularPermitIds);
  }

  function fillTemplate(template: string, fareCharged: number, fareExpected: number): string {
    const loc = pick(LOCATIONS);
    let loc2 = pick(LOCATIONS);
    while (loc2 === loc) loc2 = pick(LOCATIONS);
    return template
      .replace(/\{fare\}/g, `₹${fareCharged}`)
      .replace(/\{expected\}/g, `₹${fareExpected}`)
      .replace(/\{loc\}/g, loc)
      .replace(/\{loc2\}/g, loc2);
  }

  function fillAiSummary(category: string, fareCharged: number, fareExpected: number): string {
    const templates = AI_SUMMARIES[category] || AI_SUMMARIES.other;
    const tmpl = pick(templates);
    const pct = fareExpected > 0 ? Math.round(((fareCharged - fareExpected) / fareExpected) * 100) : 0;
    return tmpl
      .replace(/\{fare\}/g, `₹${fareCharged}`)
      .replace(/\{expected\}/g, `₹${fareExpected}`)
      .replace(/\{pct\}/g, String(pct))
      .replace(/\{expected_km\}/g, String(randomBetween(5, 15)))
      .replace(/\{meter_km\}/g, String(randomBetween(18, 30)));
  }

  interface ComplaintRecord {
    id: string;
    complaintNumber: string;
    touristId: string;
    taxiPermitId: string;
    category: string;
    severity: string;
    status: string;
    originalText: string;
    originalLanguage: string;
    translatedText: string | null;
    aiCategoryConfidence: number;
    aiSummary: string;
    aiSentimentScore: number;
    incidentLocation: string;
    incidentLat: number;
    incidentLng: number;
    incidentDatetime: Date;
    fareCharged: number | null;
    fareExpected: number | null;
    evidenceUrls: string;
    createdAt: Date;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
  }

  const complaintRecords: ComplaintRecord[] = [];

  for (let i = 0; i < 100; i++) {
    const tourist = touristRecords[i];
    const lang = tourist.preferredLang;
    const category = pickWeighted(CATEGORIES, CATEGORY_WEIGHTS);
    const severity = pickWeighted(SEVERITIES, SEVERITY_WEIGHTS);
    const status = pickWeighted(STATUSES, STATUS_WEIGHTS);
    const taxiPermitId = pickPermitId();

    const hasFare = ["overcharging", "meter_tampering", "route_deviation"].includes(category);
    const fareCharged = hasFare ? randomBetween(500, 3000) : null;
    const fareExpected = hasFare && fareCharged ? randomBetween(200, Math.max(250, Math.floor(fareCharged * 0.55))) : null;

    // Pick complaint text for the tourist's language
    const templates = COMPLAINT_TEXTS[lang] || COMPLAINT_TEXTS.en;
    const rawText = fillTemplate(templates[i % templates.length], fareCharged || 1500, fareExpected || 600);

    // English translation for non-EN complaints
    const enTemplates = COMPLAINT_TEXTS.en;
    const translatedText =
      lang !== "en"
        ? fillTemplate(enTemplates[i % enTemplates.length], fareCharged || 1500, fareExpected || 600)
        : null;

    const createdAt = daysAgo(randomBetween(1, 90));
    const acknowledgedAt =
      status !== "open"
        ? new Date(createdAt.getTime() + randomBetween(3000, 55000))
        : null;
    const resolvedAt =
      status === "resolved" || status === "closed"
        ? new Date(createdAt.getTime() + randomBetween(3600000, 86400000 * 3))
        : null;

    const location = pick(LOCATIONS);
    const zoneForLoc = pick(ZONES);
    const coords = ZONE_COORDS[zoneForLoc] || ZONE_COORDS.Panjim;

    complaintRecords.push({
      id: `complaint_${String(i + 1).padStart(3, "0")}`,
      complaintNumber: complaintNumber(i),
      touristId: tourist.id,
      taxiPermitId,
      category,
      severity,
      status,
      originalText: rawText,
      originalLanguage: lang,
      translatedText,
      aiCategoryConfidence: randomFloat(0.75, 0.95),
      aiSummary: fillAiSummary(category, fareCharged || 1500, fareExpected || 600),
      aiSentimentScore: randomFloat(-0.9, -0.3),
      incidentLocation: location,
      incidentLat: coords.lat + randomFloat(-0.02, 0.02),
      incidentLng: coords.lng + randomFloat(-0.02, 0.02),
      incidentDatetime: createdAt,
      fareCharged,
      fareExpected,
      evidenceUrls: "[]",
      createdAt,
      acknowledgedAt,
      resolvedAt,
    });
  }

  for (const c of complaintRecords) {
    await prisma.complaint.create({ data: c });
  }
  console.log(`Seeded ${complaintRecords.length} complaints.`);

  // -----------------------------------------------------------------------
  // 5. Seed Escalations (for all non-open complaints)
  // -----------------------------------------------------------------------

  const escalationRecords: Array<{
    id: string;
    complaintId: string;
    officerId: string;
    escalationType: string;
    priority: number;
    notes: string;
    status: string;
    assignedAt: Date;
    acceptedAt: Date | null;
    completedAt: Date | null;
  }> = [];

  const nonOpenComplaints = complaintRecords.filter((c) => c.status !== "open");
  let escIdx = 0;

  for (const c of nonOpenComplaints) {
    // Find officers for the zone of the complaint's taxi permit
    const permit = permitRecords.find((p) => p.id === c.taxiPermitId);
    const permitZone = permit?.zone || "Panjim";

    // Map zone to officers — use same zone or default to Panjim pair
    let zoneOfficers = officerRecords.filter((o) => o.zone === permitZone);
    if (zoneOfficers.length === 0) {
      // Map nearby zones to officers
      const zoneMapping: Record<string, string> = {
        Anjuna: "Calangute",
        Baga: "Calangute",
        Candolim: "Calangute",
        Mapusa: "Calangute",
      };
      const mappedZone = zoneMapping[permitZone] || "Panjim";
      zoneOfficers = officerRecords.filter((o) => o.zone === mappedZone);
    }
    const officer = pick(zoneOfficers);

    const priority =
      c.severity === "critical" ? 1 : c.severity === "high" ? 2 : c.severity === "medium" ? 3 : 4;

    const assignedAt = c.acknowledgedAt || c.createdAt;
    const acceptedAt =
      c.status !== "acknowledged"
        ? new Date(assignedAt.getTime() + randomBetween(60000, 1800000))
        : null;
    const completedAt =
      c.status === "resolved" || c.status === "closed"
        ? c.resolvedAt
        : null;

    const escalationType =
      c.severity === "critical" || c.severity === "high" ? "urgent" : "standard";

    const escStatus =
      c.status === "resolved" || c.status === "closed"
        ? "completed"
        : c.status === "investigating" || c.status === "escalated"
          ? "in_progress"
          : "pending";

    escalationRecords.push({
      id: `escalation_${String(++escIdx).padStart(3, "0")}`,
      complaintId: c.id,
      officerId: officer.id,
      escalationType,
      priority,
      notes: `Auto-assigned to ${officer.name} for ${permitZone} zone. Category: ${c.category}, Severity: ${c.severity}.`,
      status: escStatus,
      assignedAt,
      acceptedAt,
      completedAt,
    });
  }

  for (const e of escalationRecords) {
    await prisma.escalation.create({ data: e });
  }
  console.log(`Seeded ${escalationRecords.length} escalations.`);

  // -----------------------------------------------------------------------
  // 6. Seed Blacklist entries (5 — worst drivers)
  // -----------------------------------------------------------------------

  const blacklistDrivers = permitRecords
    .filter((p) => p.complaintCount >= 5)
    .slice(0, 5);

  const blacklistRecords = blacklistDrivers.map((permit, i) => {
    // Gather complaint IDs linked to this permit
    const relatedComplaints = complaintRecords
      .filter((c) => c.taxiPermitId === permit.id)
      .map((c) => c.id);

    // If we don't have enough actual linked complaints, pad with some
    while (relatedComplaints.length < permit.complaintCount) {
      relatedComplaints.push(`complaint_historical_${permit.id}_${relatedComplaints.length}`);
    }

    const reasonMap: Record<string, string> = {
      permit_001: "Repeated overcharging (7 complaints in 60 days). Tourists from 4 nationalities affected.",
      permit_002: "Persistent overcharging and harassment (8 complaints in 45 days). Three tourists reported feeling physically threatened.",
      permit_003: "Pattern of overcharging and unsafe driving (6 complaints in 50 days). Two near-accident reports.",
      permit_004: "Consistent refusal of service and overcharging (5 complaints in 30 days). Multiple tourists stranded.",
      permit_005: "Repeated overcharging at Vasco terminal (5 complaints in 40 days). Tourist board flagged.",
    };

    return {
      id: `blacklist_${String(i + 1).padStart(3, "0")}`,
      taxiPermitId: permit.id,
      reason: reasonMap[permit.id] || `Multiple complaints (${permit.complaintCount}) within 90-day window. Auto-flagged by system.`,
      complaintIds: JSON.stringify(relatedComplaints.slice(0, permit.complaintCount)),
      totalComplaints: permit.complaintCount,
      blacklistedAt: daysAgo(randomBetween(5, 30)),
      reviewDate: new Date(Date.now() + 30 * 86400000), // 30 days from now
      status: permit.permitStatus === "suspended" ? "active" : "under_review",
      reportWeek: (() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay() + 1); // Last Monday
        d.setHours(0, 0, 0, 0);
        return d;
      })(),
    };
  });

  for (const b of blacklistRecords) {
    await prisma.blacklist.create({ data: b });
  }
  console.log(`Seeded ${blacklistRecords.length} blacklist entries.`);

  // -----------------------------------------------------------------------
  // 7. Seed SMS Logs (for all acknowledged complaints)
  // -----------------------------------------------------------------------

  const acknowledgedComplaints = complaintRecords.filter((c) => c.status !== "open");
  const smsRecords: Array<{
    id: string;
    complaintId: string;
    recipientPhone: string;
    messageType: string;
    messageBody: string;
    language: string;
    provider: string;
    providerMsgId: string;
    status: string;
    sentAt: Date;
    deliveredAt: Date | null;
    latencyMs: number;
  }> = [];

  for (let i = 0; i < acknowledgedComplaints.length; i++) {
    const c = acknowledgedComplaints[i];
    const tourist = touristRecords.find((t) => t.id === c.touristId)!;
    const lang = tourist.preferredLang;
    const smsTemplate = SMS_TEMPLATES[lang] || SMS_TEMPLATES.en;
    const messageBody = smsTemplate.replace(/\{number\}/g, c.complaintNumber);

    const latencyMs = randomBetween(3000, 55000);
    const sentAt = c.acknowledgedAt || new Date(c.createdAt.getTime() + latencyMs);

    // 95% delivered, 3% sent, 2% failed
    const r = Math.random();
    const smsStatus = r < 0.95 ? "delivered" : r < 0.98 ? "sent" : "failed";

    const isIndianPhone = tourist.phone.startsWith("+91");
    const provider = isIndianPhone ? "msg91" : "twilio";

    smsRecords.push({
      id: `sms_${String(i + 1).padStart(3, "0")}`,
      complaintId: c.id,
      recipientPhone: tourist.phone,
      messageType: "acknowledgement",
      messageBody,
      language: lang,
      provider,
      providerMsgId: `${provider}_${Date.now().toString(36)}_${randomBetween(10000, 99999)}`,
      status: smsStatus,
      sentAt,
      deliveredAt: smsStatus === "delivered" ? new Date(sentAt.getTime() + randomBetween(1000, 5000)) : null,
      latencyMs,
    });
  }

  for (const s of smsRecords) {
    await prisma.smsLog.create({ data: s });
  }
  console.log(`Seeded ${smsRecords.length} SMS logs.`);

  // -----------------------------------------------------------------------
  // 8. Seed Notifications (20)
  // -----------------------------------------------------------------------

  const notificationTypes = [
    { type: "new_complaint", titleTemplate: "New complaint received", msgTemplate: "New complaint {num} received from {nationality} tourist regarding {category} at {location}." },
    { type: "escalation", titleTemplate: "Complaint escalated", msgTemplate: "Complaint {num} escalated to {officer} in {zone} zone. Category: {category}, Severity: {severity}." },
    { type: "driver_flagged", titleTemplate: "Driver flagged", msgTemplate: "Driver {vehicle} ({driver}) flagged — {count} complaint(s) in 30 days. Permit zone: {zone}." },
    { type: "sla_breach", titleTemplate: "SLA breach warning", msgTemplate: "SLA breach: Complaint {num} unacknowledged for over 2 hours. Immediate action required." },
  ];

  const notificationRecords: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    complaintId: string | null;
    targetRole: string;
    isRead: boolean;
    createdAt: Date;
  }> = [];

  // 5 new_complaint, 5 escalation, 5 driver_flagged, 5 sla_breach
  for (let i = 0; i < 20; i++) {
    const notifType = notificationTypes[i % 4];
    const recentComplaint = complaintRecords[randomBetween(0, 99)];
    const permit = permitRecords.find((p) => p.id === recentComplaint.taxiPermitId);
    const tourist = touristRecords.find((t) => t.id === recentComplaint.touristId);
    const relatedEscalation = escalationRecords.find((e) => e.complaintId === recentComplaint.id);
    const officer = relatedEscalation
      ? officerRecords.find((o) => o.id === relatedEscalation.officerId)
      : pick(officerRecords);

    const msg = notifType.msgTemplate
      .replace(/\{num\}/g, recentComplaint.complaintNumber)
      .replace(/\{nationality\}/g, tourist?.nationality || "International")
      .replace(/\{category\}/g, recentComplaint.category)
      .replace(/\{location\}/g, recentComplaint.incidentLocation)
      .replace(/\{officer\}/g, officer?.name || "duty officer")
      .replace(/\{zone\}/g, permit?.zone || "Panjim")
      .replace(/\{severity\}/g, recentComplaint.severity)
      .replace(/\{vehicle\}/g, permit?.vehicleNumber || "GA-01-T-0000")
      .replace(/\{driver\}/g, permit?.driverName || "Unknown")
      .replace(/\{count\}/g, String(permit?.complaintCount || 1));

    notificationRecords.push({
      id: `notif_${String(i + 1).padStart(3, "0")}`,
      type: notifType.type,
      title: notifType.titleTemplate,
      message: msg,
      complaintId: recentComplaint.id,
      targetRole: notifType.type === "escalation" ? "officer" : "admin",
      isRead: i < 8, // older ones read
      createdAt: daysAgo(randomBetween(0, 7)),
    });
  }

  for (const n of notificationRecords) {
    await prisma.notification.create({ data: n });
  }
  console.log(`Seeded ${notificationRecords.length} notifications.`);

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------

  const counts = await Promise.all([
    prisma.taxiPermit.count(),
    prisma.tourismOfficer.count(),
    prisma.tourist.count(),
    prisma.complaint.count(),
    prisma.escalation.count(),
    prisma.blacklist.count(),
    prisma.smsLog.count(),
    prisma.notification.count(),
  ]);

  console.log("\n====================================");
  console.log("  GoaSafe Database Seed Complete");
  console.log("====================================");
  console.log(`  Taxi Permits:     ${counts[0]}`);
  console.log(`  Tourism Officers: ${counts[1]}`);
  console.log(`  Tourists:         ${counts[2]}`);
  console.log(`  Complaints:       ${counts[3]}`);
  console.log(`  Escalations:      ${counts[4]}`);
  console.log(`  Blacklist:        ${counts[5]}`);
  console.log(`  SMS Logs:         ${counts[6]}`);
  console.log(`  Notifications:    ${counts[7]}`);
  console.log("====================================\n");

  // SLA compliance stat
  const deliveredSms = smsRecords.filter((s) => s.status === "delivered").length;
  const under60s = smsRecords.filter((s) => s.latencyMs <= 60000).length;
  console.log(`  SMS Delivery Rate:    ${((deliveredSms / smsRecords.length) * 100).toFixed(1)}%`);
  console.log(`  SMS Under 60s SLA:    ${((under60s / smsRecords.length) * 100).toFixed(1)}%`);
  console.log(`  Avg SMS Latency:      ${(smsRecords.reduce((a, s) => a + s.latencyMs, 0) / smsRecords.length / 1000).toFixed(1)}s`);
  console.log("");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
