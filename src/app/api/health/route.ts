import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    // Try to ping the database
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch {
    // Database not available — still return ok for the app, but flag DB
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
}
