import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const passwordSchema = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  message:
    "Password must be at least 8 characters with uppercase, lowercase, and a number",
};

export function validatePassword(password) {
  if (!password || password.length < passwordSchema.minLength) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!passwordSchema.pattern.test(password)) {
    return { valid: false, message: passwordSchema.message };
  }
  return { valid: true };
}

export function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}
