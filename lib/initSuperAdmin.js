// lib/initSuperAdmin.js
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { User } from "../models/User"

export async function initSuperAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("⏭ Skipping initSuperAdmin (no DB env)");
      return;
    }

    if (
      !process.env.SUPER_ADMIN_NAME ||
      !process.env.SUPER_ADMIN_LOGIN ||
      !process.env.SUPER_ADMIN_PASSWORD
    ) {
      console.log("⚠️ Missing super admin env, skipping...");
      return;
    }

    console.log("🔥 initSuperAdmin CALLED");

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

    const user = await User.create({
      name: process.env.SUPER_ADMIN_NAME,
      loginId: process.env.SUPER_ADMIN_LOGIN,
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("🚀 Super Admin created:", user);
  } catch (err) {
    console.error("❌ ERROR in initSuperAdmin:", err);
  }
}