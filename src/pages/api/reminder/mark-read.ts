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

  if (req.method !== "PATCH") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    const dbUser: any = await User.findById(authUser.id).lean();

    const { reminderId, markAll } = req.body;

    let targetNotifyToId = new mongoose.Types.ObjectId(
      dbUser?.candidateProfile?.leadId || authUser.id
    );

    if (markAll) {
      await Reminder.updateMany(
        { notifyTo: targetNotifyToId, read: false },
        { $set: { read: true } }
      );
      return ResponseHandler.sendSuccess(res, null, "All reminders marked as read");
    }

    if (reminderId) {
      await Reminder.findByIdAndUpdate(reminderId, { $set: { read: true } });
      return ResponseHandler.sendSuccess(res, null, "Reminder marked as read");
    }

    throw new ApiError("Invalid payload", 400);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Failed to update reminder", 500);
  }
}