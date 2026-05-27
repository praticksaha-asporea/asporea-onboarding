import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";

import { saveExperienceTypeService } from "@/lib/services/experience/experience.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const { leadId, experienceType } = req.body;

    const updatedLead = await saveExperienceTypeService(leadId, experienceType);

    return ResponseHandler.sendSuccess(
      res,
      updatedLead,
      "Experience saved and status updated",
    );
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return ResponseHandler.sendError(
      res,
      error.message || "Unknown error occurred",
      statusCode,
    );
  }
}
