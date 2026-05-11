import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
    getTokenFromHeader,
    verifyToken,
} from "@/lib/middleware/auth.middleware";
import { branchList } from "@/lib/services/admin/branch.service";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await connectToDatabase();

    if (req.method !== "GET")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);
        const authUser = await verifyToken(token);
        if (authUser.role !== "admin")
            throw new ApiError("Admin access required", 403);

        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;

        if (isNaN(page) || page <= 0)
            return ResponseHandler.sendError(res, "Invalid page number", 400);
        if (isNaN(limit) || limit <= 0 || limit > 100)
            return ResponseHandler.sendError(res, "Invalid limit (max 100)", 400);

        const keyword =
            typeof req.query.keyword === "string" ? req.query.keyword : undefined;

        const data = await branchList({ keyword, page, limit });

        return ResponseHandler.sendSuccess(res, data, "Branch list fetched");
    } catch (error: unknown) {
        if (error instanceof ApiError)
            return ResponseHandler.sendError(
                res,
                error.message,
                error.statusCode,
                error.data,
            );
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}
