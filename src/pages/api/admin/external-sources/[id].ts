import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { updateExternalSource, toggleSourceStatus, getExternalSourceById } from "@/lib/services/admin/externalSource.service";
import { updateExternalSourceSchema } from "@/lib/validation/externalSource.validation";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;
  await connectToDatabase();

  const { id } = req.query;
  if (!id || typeof id !== "string") return ResponseHandler.sendError(res, "Invalid ID", 400);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

    if (req.method === "GET") {
      const data = await getExternalSourceById(id);
      return ResponseHandler.sendSuccess(res, data, "Source details fetched");
    } 
    else if (req.method === "PUT") {

      const { error, value } = updateExternalSourceSchema.validate(req.body);
      if (error) {
        throw new ApiError(error.details[0].message, 400);
      }
      
      const data = await updateExternalSource(id,value);
      return ResponseHandler.sendSuccess(res, data, "Source updated successfully");
    } 
    else if (req.method === "PATCH") {
      
      const { targetStatus } = req.body;  
      const data = await toggleSourceStatus(id, targetStatus);
      return ResponseHandler.sendSuccess(res, data, data.message);
    } 
    else if (req.method === "DELETE") {
     
      const data = await toggleSourceStatus(id, "inactive");
      return ResponseHandler.sendSuccess(res, data, "Source deactivated successfully");
    } 
    else {
      return ResponseHandler.sendError(res, "Method not allowed", 405);
    }
  } catch (error: any) {
    return ResponseHandler.sendError(res, error.message || "Unknown error", error.statusCode || 500);
  }
}