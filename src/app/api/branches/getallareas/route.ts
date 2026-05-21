// src/app/api/branches/getallareas/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Branch } from "../../../../../models/Branch";

export const dynamic = "force-dynamic";

function toTitleCase(input: string) {
  return input
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function GET() {
  try {
    await connectToDatabase();

    const branches = await Branch.find({}, { city: 1, serviceAreas: 1 })
      .lean()
      .exec();

    const areaSet = new Set<string>();

    for (const b of branches as Array<{ city?: string; serviceAreas?: string[] }>) {
      if (b.city && String(b.city).trim()) {
        areaSet.add(toTitleCase(String(b.city).trim()));
      }
      if (Array.isArray(b.serviceAreas)) {
        for (const a of b.serviceAreas) {
          const cleaned = String(a ?? "").trim();
          if (cleaned) areaSet.add(toTitleCase(cleaned));
        }
      }
    }

    const areas = Array.from(areaSet).sort((a, b) => a.localeCompare(b));
    return NextResponse.json(areas);
  } catch (e) {
    console.error("GET ALL AREAS ERROR:", e);
    return NextResponse.json({ error: "Failed to load areas" }, { status: 500 });
  }
}

