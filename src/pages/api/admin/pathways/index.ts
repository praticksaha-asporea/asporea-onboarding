import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
    createPathwayService,
    getPathwaysService,
} from "../../../../lib/services/admin/pathway.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);

        const authUser = await verifyToken(token);
        if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

        if (req.method === "POST") {
            const { title, underPathway } = req.body;
            const result = await createPathwayService(title, underPathway);
            return ResponseHandler.sendSuccess(res, result, "Pathway created successfully", 201);
        }

        if (req.method === "GET") {
            const { active } = req.query;
            const onlyActive = active === "true";
            const result = await getPathwaysService(onlyActive);
            return ResponseHandler.sendSuccess(res, result, "Pathways fetched successfully");
        }

        return ResponseHandler.sendError(res, "Method not allowed", 405);
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
        }
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}