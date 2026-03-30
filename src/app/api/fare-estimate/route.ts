import { NextResponse } from "next/server";
import { FARE_REFERENCE, AIRPORT_FIXED_RATES } from "@/lib/constants/fare-reference";

type VehicleType = keyof typeof FARE_REFERENCE;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const distanceStr = searchParams.get("distance");
    const vehicleType = (searchParams.get("vehicleType") || "taxi_sedan") as VehicleType;
    const destination = searchParams.get("destination");

    // If asking for airport fixed rate
    if (destination) {
      const normalizedDest = destination.toLowerCase().trim();
      const fixedRate = AIRPORT_FIXED_RATES[normalizedDest];
      if (fixedRate) {
        return NextResponse.json({
          success: true,
          data: {
            type: "airport_fixed",
            destination: normalizedDest,
            estimatedFare: fixedRate,
            currency: "INR",
            note: "Fixed airport rate — no meter needed",
          },
        });
      }
    }

    // Distance-based fare estimate
    if (!distanceStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'distance' (km) or 'destination' query parameter",
          availableVehicleTypes: Object.keys(FARE_REFERENCE),
          availableDestinations: Object.keys(AIRPORT_FIXED_RATES),
        },
        { status: 400 }
      );
    }

    const distance = parseFloat(distanceStr);
    if (isNaN(distance) || distance <= 0) {
      return NextResponse.json(
        { success: false, error: "Distance must be a positive number in km" },
        { status: 400 }
      );
    }

    const fareConfig = FARE_REFERENCE[vehicleType];
    if (!fareConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid vehicle type. Available: ${Object.keys(FARE_REFERENCE).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const estimatedFare = fareConfig.baseFare + fareConfig.perKm * distance;
    const fareRange = {
      low: Math.round(estimatedFare * 0.9),
      estimated: Math.round(estimatedFare),
      high: Math.round(estimatedFare * 1.15),
    };

    return NextResponse.json({
      success: true,
      data: {
        type: "distance_based",
        distance,
        vehicleType,
        vehicleLabel: fareConfig.label,
        baseFare: fareConfig.baseFare,
        perKm: fareConfig.perKm,
        fareRange,
        currency: "INR",
        note: "Estimate only — actual meter fare may vary slightly",
      },
    });
  } catch (error) {
    console.error("Fare estimate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate fare estimate" },
      { status: 500 }
    );
  }
}
