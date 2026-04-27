// src/app/api/load-statements/[id]/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { LoadStatement } from "../../../../../models/LoadStatement";
import { Message } from "../../../../../models/Message";
import { User } from "../../../../../models/User";
import { verifyToken } from "../../../../../lib/jwt";
import { Bill } from "../../../../../models/Bill"
import { Trip } from "../../../../../models/Trip"
import { Branch } from "../../../../../models/Branch"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 note: params is async
) {
  try {
    await connectToDatabase();
       // ✅ Force schemas to register before populate
    void Bill;
    void Trip;

    const { id } = await context.params; // 👈 await it here

    if (!id) {
      return NextResponse.json({ error: "Load Statement ID is required" }, { status: 400 });
    }

    const statement = await LoadStatement.findById(id)
      .populate("branch", "name city phone address")
      .populate({
        path: "trips",
        populate: {
          path: "bills",
          select: "billId totalAmount city date",
        },
      });

    if (!statement) {
      return NextResponse.json({ error: "Load Statement not found" }, { status: 404 });
    }

    return NextResponse.json(statement, { status: 200 });
  } catch (error) {
    console.error("Error fetching load statement by ID:", error);
    return NextResponse.json({ error: "Failed to fetch load statement" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Get user from JWT token in cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      user = await verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details to get the name
    const adminUser = await User.findById(user.id).select("name email");
    const adminName = adminUser?.name || "Admin";

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Load Statement ID is required" }, { status: 400 });
    }

    const { amount, note } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid payment amount required" }, { status: 400 });
    }

    const statement = await LoadStatement.findById(id);

    if (!statement) {
      return NextResponse.json({ error: "Load Statement not found" }, { status: 404 });
    }

    // Check if payment exceeds balance due
    if (amount > statement.balanceDue) {
      return NextResponse.json(
        { error: `Payment amount cannot exceed balance due (${statement.balanceDue})` },
        { status: 400 }
      );
    }

    // Record payment
    statement.paidAmount += amount;
    statement.balanceDue -= amount;

    // Add to payment history
   statement.paymentHistory.push({
  amount,
  paidOn: new Date(),           // ✅ was: date
  note: note || "",
  recordedBy: new mongoose.Types.ObjectId(user.id),  // ✅ was: recordedByAdmin
  recordedByName: adminName,    // ✅ was: recordedByAdminName
});

    // Auto-close statement if balance is zero
    if (statement.balanceDue <= 0) {
      statement.paymentStatus = "paid";
      statement.balanceDue = 0;
      statement.closedAt = new Date();
    } else if (statement.balanceDue < statement.totalFreightAmount) {
      statement.paymentStatus = "partial";
    }

    await statement.save();

    // Create system message notification to agent
    try {
      await Message.create({
        branch: statement.branch,
        sender: null,
        senderName: "System",
        senderRole: "system",
        type: "PAYMENT_RECEIVED",
        title: "Payment Recorded",
        content: `Payment of $${amount} received on Load Statement #${statement.loadStatementId}. Balance due: $${statement.balanceDue}${note ? ` (Note: ${note})` : ""}`,
      });
    } catch (msgError) {
      console.error("Error creating notification message:", msgError);
      // Don't fail the payment recording if message creation fails
    }

    // Fetch fresh data with populated fields
    const updatedStatement = await LoadStatement.findById(id)
      .populate("branch", "name city phone address")
      .populate({
        path: "trips",
        populate: {
          path: "bills",
          select: "billId totalAmount city date",
        },
      });

    return NextResponse.json(updatedStatement, { status: 200 });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
