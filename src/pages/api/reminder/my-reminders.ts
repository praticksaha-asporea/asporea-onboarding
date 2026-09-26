import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import ResponseHandler from "@/lib/utils/responseUtil";
import { Reminder } from "@/lib/models/Reminder.model";
import User from "@/lib/models/User.model";
import "@/lib/models/Upload.model";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors && applyCors(req, res)) return;

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);

    // DB se actual user details fetch kar rahe hain TS error se bachne ke liye
    const dbUser: any = await User.findById(authUser.id).lean();

    let targetNotifyToId = new mongoose.Types.ObjectId(authUser.id);

    // Agar User candidate hai aur candidateProfile me leadId hai
    if (dbUser?.candidateProfile?.leadId) {
      targetNotifyToId = new mongoose.Types.ObjectId(dbUser.candidateProfile.leadId);
    }

    const reminders = await Reminder.find({ notifyTo: targetNotifyToId })
      .populate({
        path: "sentFrom",
        model: User,
        select: "firstName lastName email role profilePic",
        populate: { path: "profilePic", select: "path url" },
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return ResponseHandler.sendSuccess(
      res,
      reminders,
      "My reminders fetched successfully"
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Failed to fetch reminders", 500);
  }
}