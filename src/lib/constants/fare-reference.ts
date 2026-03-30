export const FARE_REFERENCE = {
  auto_rickshaw: {
    baseFare: 30,
    perKm: 15,
    label: "Auto Rickshaw",
  },
  taxi_sedan: {
    baseFare: 100,
    perKm: 22,
    label: "Taxi (Sedan)",
  },
  taxi_suv: {
    baseFare: 150,
    perKm: 30,
    label: "Taxi (SUV)",
  },
} as const;

export const AIRPORT_FIXED_RATES: Record<string, number> = {
  panjim: 900,
  calangute: 750,
  margao: 500,
  vasco: 350,
  anjuna: 800,
  baga: 750,
  candolim: 700,
  mapusa: 600,
  colva: 550,
  benaulim: 600,
};

export const GOA_ZONES = [
  "Calangute",
  "Panjim",
  "Margao",
  "Vasco",
  "Anjuna",
  "Baga",
  "Candolim",
  "Mapusa",
  "Colva",
  "Mormugao",
  "Dabolim Airport",
] as const;

export const SEVERITY_CONFIG = {
  critical: {
    responseMinutes: 15,
    escalateTo: "zone_supervisor",
    color: "#dc2626",
    label: "Critical",
  },
  high: {
    responseMinutes: 30,
    escalateTo: "zone_supervisor",
    color: "#f59e0b",
    label: "High",
  },
  medium: {
    responseMinutes: 120,
    escalateTo: "senior_officer",
    color: "#3b82f6",
    label: "Medium",
  },
  low: {
    responseMinutes: 480,
    escalateTo: null,
    color: "#6b7280",
    label: "Low",
  },
} as const;

export const BLACKLIST_THRESHOLDS = {
  flagCount: 3,
  flagWindowDays: 30,
  blacklistCount: 5,
  blacklistWindowDays: 90,
} as const;
