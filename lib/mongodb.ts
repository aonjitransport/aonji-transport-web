// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://admintest:admintest@cluster0.mo0yypa.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";


if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
