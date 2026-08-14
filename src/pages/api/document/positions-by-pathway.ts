import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { positionListbyType } from "@/lib/services/admin/position.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();

    if (req.method !== "GET")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);
        await verifyToken(token);

        const pathwayId = req.query.id as string;
        if (!pathwayId) throw new ApiError("Pathway ID is required", 400);

        const data = await positionListbyType({ pathWay: pathwayId });
        return ResponseHandler.sendSuccess(res, data, "Positions fetched successfully");
    } catch (error: unknown) {
        if (error instanceof ApiError)
            return ResponseHandler.sendError(res, error.message, error.statusCode);
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}