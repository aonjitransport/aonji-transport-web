// src/app/api/load-statements/[id]/payment/route.ts
import  mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { requireRole } from "../../../../../../lib/auth";
import { LoadStatement,ILoadStatement } from "../../../../../../models/LoadStatement";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  const { id } = await context.params;
  const { amount, note } = await req.json();

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
  }

  const statement = await LoadStatement.findById(id);
  if (!statement) {
    return NextResponse.json({ error: "Statement not found" }, { status: 404 });
  }

  if (statement.paymentStatus === "paid") {   // ✅ check exact string
  return NextResponse.json({ error: "Statement already closed" }, { status: 400 });
}

  const payAmount = Math.min(Number(amount), statement.balanceDue);

statement.paidAmount = (statement.paidAmount || 0) + payAmount;
statement.balanceDue = Math.max(0, (statement.balanceDue || 0) - payAmount); // ✅ no netPayableToMain needed

statement.paymentHistory.push({
  amount: payAmount,
  paidOn: new Date(),
  recordedBy: new mongoose.Types.ObjectId(auth.user.id),
  note: note || "",
  recordedByName: "",
});

if (statement.balanceDue <= 0) {
  statement.balanceDue = 0;
  statement.paymentStatus = "paid";
  statement.closedAt = new Date();
} else if (statement.paidAmount > 0) {
  statement.paymentStatus = "partial";
} else {
  statement.paymentStatus = "pending";
}

await statement.save();
return NextResponse.json(statement);
  
}