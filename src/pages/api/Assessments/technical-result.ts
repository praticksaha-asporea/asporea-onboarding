import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";

 
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";

// Services and Validations
import { addTechnicalResult, getTechnicalResult } from "@/lib/services/Assessments/technical.service";
import { addTechnicalResultSchema } from "@/lib/validation/technicalValidation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   
  await connectToDatabase();
 
  if (req.method === "POST") {
    try {
    

      const { error } = addTechnicalResultSchema.validate(req.body);
      if (error) {
        throw new ApiError(error.details.map((d) => d.message).join(", "), 400);
      }

      const data = await addTechnicalResult(req.body, "TEST_ADMIN_BYPASS");
      return ResponseHandler.sendSuccess(res, data, "Technical Result added successfully");
    } catch (error: unknown) {
      if (error instanceof ApiError) return ResponseHandler.sendError(res, error.message, error.statusCode);
      return ResponseHandler.sendError(res, "Unknown error occurred while adding data", 500);
    }
  }

  
  else if (req.method === "GET") {
    try {
  
      const token = getTokenFromHeader(req);
      if (!token) throw new ApiError("Unauthenticated user! Please log in.", 401);

      
      const authUser = await verifyToken(token);

      const { leadId } = req.query;
      if (!leadId) {
        throw new ApiError("Lead ID is required in query params", 400);
      }
 
      const data = await getTechnicalResult(leadId as string);
      
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