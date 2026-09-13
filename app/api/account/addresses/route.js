import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth/session";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  area: z.string().min(2),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().optional(),
  country: z.string().default("Pakistan"),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400);
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return jsonError("User not found", 404);

    if (parsed.data.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    user.addresses.push(parsed.data);
    await user.save();

    return jsonSuccess({ addresses: user.addresses }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");
    if (!addressId) return jsonError("Address ID required", 400);

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return jsonError("User not found", 404);

    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();

    return jsonSuccess({ addresses: user.addresses });
  } catch (error) {
    return handleApiError(error);
  }
}
