import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";

 
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";

// Services and Validations
import { getAssessmentResult } from "@/lib/services/Assessments/assessment-tool.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   
  await connectToDatabase();
  
  if (req.method === "GET") {
    try {
  
      const token = getTokenFromHeader(req);
      if (!token) throw new ApiError("Unauthenticated user! Please log in.", 401);

      
      const authUser = await verifyToken(token);

      const { leadId } = req.query;
      if (!leadId) {
        throw new ApiError("Lead ID is required in query params", 400);
      }
 
      const data = await getAssessmentResult(leadId as string);
      
      return ResponseHandler.sendSuccess(res, data, "Result fetched successfully");
    } catch (error: unknown) {
      if (error instanceof ApiError) return ResponseHandler.sendError(res, error.message, error.statusCode);
      return ResponseHandler.sendError(res, "Unknown error occurred while fetching data", 500);
    }
  }

 
  else {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }
}