import mongoose from "mongoose";
import { getEnv } from "./env";

/** @type {typeof mongoose | null} */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const env = getEnv();
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isDBConfigured() {
  return !!getEnv().MONGODB_URI;
}
