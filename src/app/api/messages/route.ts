// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";
import { connectToDatabase } from "../../../../lib/mongodb";
import { requireRole } from "../../../../lib/auth";
import { User } from "../../../../models/User";
import { Message } from "../../../../models/Message";
import { AppJwtPayload } from "../../../../lib/jwt";

// ✅ Pusher server instance — inline, no separate lib file needed
const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// GET /api/messages?branchId=xxx
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const after = searchParams.get("after");
  const isReadParam = searchParams.get("isRead");

  if (!branchId) {
    return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  }

  const query: Record<string, unknown> = { branch: branchId };
  if (after) query.createdAt = { $gt: new Date(after) };
  if (isReadParam !== null) query.isRead = isReadParam === "true";

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("sender", "name role")
    .lean();

  return NextResponse.json(messages);
}

// POST /api/messages
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { branchId, content, isSystemMessage, type, title, senderName } = body;

  if (!content?.trim()) {
    return NextResponse.json({ message: "Empty message" }, { status: 400 });
  }
  if (!branchId) {
    return NextResponse.json({ message: "branchId is required" }, { status: 400 });
  }

  // System message
  if (isSystemMessage) {
    const message = await Message.create({
      branch: branchId,
      sender: null,
      senderName: senderName || "System",
      senderRole: "system",
      type: type || "GENERAL",
      title: title || null,
      content: content.trim(),
    });
    return NextResponse.json(message, { status: 201 });
  }

  // User message
  const user = (auth as { user: AppJwtPayload }).user;
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userFromDb = await User.findById(user.id).lean() as { name?: string } | null;
  const actualUserName = userFromDb?.name || "Unknown User";

  const message = await Message.create({
    branch: branchId,
    sender: user.id,
    senderName: actualUserName,
    senderRole: user.role,
    content: content.trim(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name role")
    .lean();

  // ✅ Trigger Pusher — notify all subscribers of this branch channel
  await pusherServer.trigger(
    `branch-${branchId}`,
    "new-message",
    populatedMessage
  );

  return NextResponse.json(populatedMessage, { status: 201 });
}

// PATCH /api/messages — Mark all messages as read for a branch
export async function PATCH(req: NextRequest) {
  await connectToDatabase();

  const { branchId } = await req.json();

  if (!branchId) {
    return NextResponse.json({ message: "branchId is required" }, { status: 400 });
  }

  const result = await Message.updateMany(
    { branch: branchId, isRead: false },
    { $set: { isRead: true } }
  );

  return NextResponse.json({
    message: "Messages marked as read",
    modifiedCount: result.modifiedCount,
  });
}