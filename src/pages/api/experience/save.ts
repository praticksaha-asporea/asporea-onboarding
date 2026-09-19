import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { saveExperienceTypeService } from "@/lib/services/experience/experience.service";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    const user = token ? await verifyToken(token) : null;
    const { leadId, experienceType } = req.body;

    const updatedLead = await saveExperienceTypeService(leadId, experienceType,user?.id);
    
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
