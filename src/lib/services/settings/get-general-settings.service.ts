import connectToDatabase from "@/lib/mongodb";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import { ApiError } from "@/lib/error/api.error";
import "@/lib/models/Upload.model";

export const getGeneralSettingsService = async () => {
  await connectToDatabase();

  let settings = await GeneralSettingModel.findOne()
    .populate("inquiryBrochures.uploadId", "path publicId")
    .lean();

  if (!settings) {
    const created = await GeneralSettingModel.create({});
    
    if (!created) {
      throw new ApiError("Failed to initialize general settings", 500);
    }
    
    settings = created.toObject ? created.toObject() : created;
  }

  return settings;
};