import { FARE_REFERENCE, AIRPORT_FIXED_RATES } from "@/lib/constants/fare-reference";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type VehicleType = keyof typeof FARE_REFERENCE;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Estimate a fair fare for a given distance and vehicle type.
 * Uses the government-approved fare chart for Goa taxis.
 */
export function estimateFare(distanceKm: number, vehicleType: string): number {
  const key = vehicleType as VehicleType;
  const fareInfo = FARE_REFERENCE[key] ?? FARE_REFERENCE.taxi_sedan; // Default to sedan

  const fare = fareInfo.baseFare + distanceKm * fareInfo.perKm;

  // Round to nearest 10
  const rounded = Math.round(fare / 10) * 10;

  console.log(
    `[FareEstimation] ${fareInfo.label}: base ₹${fareInfo.baseFare} + ${distanceKm}km × ₹${fareInfo.perKm} = ₹${rounded}`
  );

  return rounded;
}

/**
 * Look up the fixed airport fare for a known destination.
 * Returns null if the destination is not in the fixed-rate table.
 */
export function estimateAirportFare(destination: string): number | null {
  const key = destination.toLowerCase().trim();

  // Try exact match first
  if (key in AIRPORT_FIXED_RATES) {
    const fare = AIRPORT_FIXED_RATES[key];
    console.log(`[FareEstimation] Airport → ${destination}: fixed rate ₹${fare}`);
    return fare;
  }

  // Try partial match (e.g., "calangute beach" → "calangute")
  for (const [dest, fare] of Object.entries(AIRPORT_FIXED_RATES)) {
    if (key.includes(dest) || dest.includes(key)) {
      console.log(`[FareEstimation] Airport → ${destination} (matched "${dest}"): fixed rate ₹${fare}`);
      return fare;
    }
  }

  console.log(`[FareEstimation] Airport → ${destination}: no fixed rate found`);
  return null;
}

/**
 * Calculate the overcharge ratio and determine severity.
 * ratio = charged / estimated
 * isOvercharged if ratio > 1.3 (30% above fair fare)
 */
export function calculateOverchargeRatio(
  charged: number,
  estimated: number
): { ratio: number; isOvercharged: boolean; severity: string } {
  if (estimated <= 0) {
    return { ratio: 0, isOvercharged: false, severity: "unknown" };
  }

  const ratio = Number((charged / estimated).toFixed(2));
  const isOvercharged = ratio > 1.3;

  let severity: string;
  if (ratio >= 3.0) {
    severity = "critical"; // 3x+ the fair fare
  } else if (ratio >= 2.0) {
    severity = "high"; // 2-3x the fair fare
  } else if (ratio >= 1.5) {
    severity = "medium"; // 1.5-2x the fair fare
  } else if (ratio > 1.3) {
    severity = "low"; // 1.3-1.5x the fair fare
  } else {
    severity = "none"; // Within acceptable range
  }

  console.log(
    `[FareEstimation] Overcharge check: charged ₹${charged} / estimated ₹${estimated} = ${ratio}x → ${isOvercharged ? severity : "not overcharged"}`
  );

  return { ratio, isOvercharged, severity };
}
