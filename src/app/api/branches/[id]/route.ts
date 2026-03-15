//api/branches/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Branch } from "../../../../../models/Branch";
import { User } from "../../../../../models/User";
import bcrypt from "bcryptjs";
import { requireRole } from "../../../../../lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;  
    if (!id) {  
    return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
    }   
    const auth = await requireRole(req, ["admin", "super_admin","agent"]);
    if (auth instanceof NextResponse) return auth;

  await connectToDatabase();
  const branch = await Branch.findById(id).lean();
  if (!branch) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }     
    return NextResponse.json(branch);
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;  
    if (!id) {  
    return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
    }   
    const auth = await requireRole(req, ["admin", "super_admin"]);
    if (auth instanceof NextResponse) return auth;      
    await connectToDatabase();  
    const body = await req.json();
    const updatedBranch = await Branch.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBranch) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }   
    return NextResponse.json(updatedBranch);
}   


