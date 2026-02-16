// lib/initSuperAdmin.js
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { User } from "../models/User"

export async function initSuperAdmin() {
  await connectToDatabase();

  const existing = await User.findOne({ role: "super_admin" });

  if (existing) {
    console.log("✅ Super Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD,
    10
  );

  await User.create({
    name: process.env.SUPER_ADMIN_NAME,
    loginId: process.env.SUPER_ADMIN_LOGIN,
    password: hashedPassword,
    role: "super_admin",
    isActive: true,
  });

  console.log("🚀 Super Admin created successfully");
}
