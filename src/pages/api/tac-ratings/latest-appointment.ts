import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import connectToDatabase from "@/lib/mongodb";
import { getLeadLastAppointment } from "@/lib/services/tacRating/tacRating.service";
import ResponseHandler from "@/lib/utils/responseUtil";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);
        const authUser = await verifyToken(token);
        if (req.method === "GET") {
            const leadId = req.query.leadId as string;

            const result = await getLeadLastAppointment(leadId);

            return ResponseHandler.sendSuccess(res, result, "Lead last appointment fetched successfully", 200);
        }


        return ResponseHandler.sendError(res, "Method not allowed", 405);
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
        }
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}