import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/auth";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { User } from "../../../../../models/User";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "agent", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  const user = await User.findById(auth.user.id)
    .select("name role branchId")
    .lean();

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      branchId: user.branchId?.toString() || null, // ✅ THIS is what frontend uses
    },
  });
}
