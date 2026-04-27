// app/api/agencies/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "../../../../../lib/mongodb"
import { Agency } from '../../../../../models/Agency'
import { requireRole } from 'lib/auth';

export const dynamic = "force-dynamic";
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 🛡 Require authorization (admin only)
    const auth = await requireRole(req, ['admin']);
    if (auth instanceof NextResponse) return auth;
   
    const id = params.id;
    const data = await req.json();

    await connectToDatabase();

    const updatedAgency = await Agency.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedAgency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully", updatedAgency }, { status: 200 });

  } catch (error) {
    console.error("Error updating agency:", error);
    return NextResponse.json({ error: "Error updating agency, try again." }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;

    const deletedAgency = await Agency.findByIdAndDelete(id);

    if (!deletedAgency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Agency deleted successfully", deletedAgency },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting agency:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}