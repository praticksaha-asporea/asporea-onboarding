import { ApiError } from "@/lib/error/api.error";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import connectToDatabase from "@/lib/mongodb";
import { updateGeneralSettingsSchema } from "@/lib/validation/generalSettingValidation";

export interface IUpdateGeneralSettingsPayload {
  escalationTimelineHours?: number;
  inqResTimelineHours?: number;
  preCounsellingTimelineHours?: number;
  assessmentTimelineHours?: number;
  tacAssignmentType?: "random" | "counterwise";
  inquiryNumberFormat?: string;
  lastFy?: string;
  assessment?: {
    fullMarks?: number;
    passingMarks?: number;
  };
  technical?: {
    fullMarks?: number;
    passingMarks?: number;
  };
}

export const updateGeneralSettingsService = async (
  payload: any,
  userRole?: string,
) => {
  if (userRole !== "admin") {
    throw new ApiError("Admin access required", 403);
  }

  const { error, value } = updateGeneralSettingsSchema.validate(payload);
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw new ApiError(message, 400);
  }

  await connectToDatabase();

  const updated = await GeneralSettingModel.findOneAndUpdate(
    {},
    { $set: value },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();

  return updated;
};
