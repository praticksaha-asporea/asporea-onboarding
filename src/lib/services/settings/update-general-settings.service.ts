import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { ApiError } from "@/lib/error/api.error";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import connectToDatabase from "@/lib/mongodb";
import { updateGeneralSettingsSchema } from "@/lib/validation/generalSettingValidation";
import { Upload } from "@/lib/models/Upload.model";

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
  userId?: string
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
const processedBrochures = [];
  if (value.inquiryBrochures && Array.isArray(value.inquiryBrochures)) {
    for (const brochure of value.inquiryBrochures) {
      // 1. Agar nayi file Base64 format me aayi hai
      if (brochure.fileData && typeof brochure.fileData === "string" && brochure.fileData.startsWith("data:")) {
        const matches = brochure.fileData.match(/^data:([A-Za-z-+\/.]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const mimeType = matches[1]; // e.g., image/jpeg, application/pdf
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          
          let extension = "pdf";
          if (mimeType.includes("image/jpeg")) extension = "jpeg";
          else if (mimeType.includes("image/png")) extension = "png";
          else if (mimeType.includes("openxmlformats")) extension = "docx"; // .docx
          else if (mimeType.includes("msword")) extension = "doc"; // .doc

          const fileName = `brochure_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads", "Brochures");

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          fs.writeFileSync(path.join(uploadDir, fileName), buffer);

          // Create Upload Document
          const uploadDoc = await Upload.create({
            userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
            path: `/uploads/Brochures/${fileName}`,
          });

          processedBrochures.push({
            name: brochure.name,
            uploadId: uploadDoc._id,
          });
        }
      } 
      // 2. Agar existing uploaded file hai (jiska uploadId pehle se hai)
      else if (brochure.uploadId) {
        processedBrochures.push({
          name: brochure.name,
          uploadId: brochure.uploadId,
        });
      }
    }
  }
  
  // Update value object with processed brochures array (containing only DB ids)
  value.inquiryBrochures = processedBrochures;
  const updated = await GeneralSettingModel.findOneAndUpdate(
    {},
    { $set: value },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();

  return updated;
};
