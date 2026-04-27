// lib/mongodb.ts
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
import mongoose from "mongoose";
import { initSuperAdmin } from "./initSuperAdmin";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };
let isInitialized = false;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;

  if (!isInitialized) {
    await initSuperAdmin();
    isInitialized = true;
  }

  return cached.conn;
}