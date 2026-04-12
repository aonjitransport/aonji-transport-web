// lib/initSuperAdmin.js
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { User } from "../models/User"

export async function initSuperAdmin() {
  try {
    console.log("🔥 initSuperAdmin CALLED");

    await connectToDatabase();
    console.log("✅ DB Connected");

    const existing = await User.findOne({ role: "super_admin" });
    console.log("🔍 Existing:", existing);

    if (existing) {
      console.log("✅ Super Admin already exists");
      return;
    }

    console.log("📦 ENV CHECK:", {
      name: process.env.SUPER_ADMIN_NAME,
      login: process.env.SUPER_ADMIN_LOGIN,
      password: process.env.SUPER_ADMIN_PASSWORD,
    });

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