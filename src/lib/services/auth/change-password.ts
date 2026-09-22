// register.service.ts
import UserModel from "../../models/User.model";
import { comparePassword, hashPassword } from "../../utils/bcryptUtil";
import { ApiError } from "../../error/api.error";
import { changePasswordPayload } from "@/Types/Backend_Payload/auth.types";
import mongoose from "mongoose";
import { Lead } from "../../models/Lead.model";
import { createLeadLogService } from "@/lib/services/leadActivity/leadLog.service";
export const changePassword = async (payload: changePasswordPayload) => {
  const { userId, newPassword, oldPassword, confirmPassword } = payload;

  if (!userId) {
    throw new ApiError("User id is not provided ", 400);
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError("All password fields are required ", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError("Passwords do not match", 400);
  }

  const user = await UserModel.findById(userId).select("+password");

  if (!user || !user.password) {
    throw new ApiError("User not found or password not set", 400);
  }
  if (user.status !== "active") {
    throw new ApiError("User is not active.", 403);
  }

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError("Old password is incorrect", 403);
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();
  try {
    const linkedLead = await Lead.findOne({
      $or: [
        { _id: user.candidateProfile?.leadId },
        { "createdBy.id": new mongoose.Types.ObjectId(userId) },
      ],
    })
      .select("_id")
      .lean();

    const targetLeadId = linkedLead?._id || user.candidateProfile?.leadId;

    if (targetLeadId) {
      const rawRole = user.role || "user";
      const roleLabel =
        rawRole === "user" ? "CANDIDATE" : rawRole.toUpperCase();

      const actionType = `PASSWORD_CHANGED_BY_${roleLabel}`;
      const actionNote = "Account security password updated successfully";

      await createLeadLogService(
        String(targetLeadId),
        actionType,
        actionNote,
        userId,
      );
    }
  } catch (logError) {
    console.error("Password Change LeadLog Error:", logError);
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastname: user.lastName,
    email: user.email,
    updatedAt: user.updatedAt,
  };
};
