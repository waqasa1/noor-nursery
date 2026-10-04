/**
 * Bootstraps the admin user only.
 * Categories and products come from the spreadsheets — see scripts/catalog/
 * and run `npm run seed:catalog`.
 * Usage: node scripts/seed.mjs
 * Requires MONGODB_URI in environment.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI environment variable");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, default: "customer" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@noornursery.pk";
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin123!Secure";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      phone: "+92 349 2849062",
      passwordHash,
      role: "admin",
    });
    console.log("Created admin user:", adminEmail);
  } else {
    console.log("Admin user already exists");
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
