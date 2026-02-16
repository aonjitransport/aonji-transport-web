import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb"
import { Bill } from "../../../../../models/Bill"

// 🔍 Search consignees dynamically

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const area = searchParams.get("area"); // TO location

    if (!search || !area) {
      return NextResponse.json([]);
    }

    // 🔥 Query only relevant bills
    const bills = await Bill.find({
      to: area,
      "consignees.name": { $regex: search, $options: "i" },
    }).select("consignees");

    // 🔥 Flatten consignees
    const allConsignees = bills.flatMap(bill => bill.consignees || []);

    // 🔥 Filter + dedupe by PHONE
    const uniqueConsignees = Array.from(
      new Map(
        allConsignees
          .filter(c =>
            c.name?.toLowerCase().includes(search.toLowerCase())
          )
          .map(c => [
            c.phone, // 🔑 UNIQUE KEY
            {
              name: c.name,
              phone: c.phone,
              address: c.address,
            },
          ])
      ).values()
    );

    return NextResponse.json(uniqueConsignees);
  } catch (error) {
    console.error("Consignee search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consignees" },
      { status: 500 }
    );
  }
}
