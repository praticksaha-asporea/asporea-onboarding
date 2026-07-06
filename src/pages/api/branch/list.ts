import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { branchList } from "@/lib/services/admin/branch.service";
import { applyCors } from "@/lib/cors";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    if (req.method !== "GET")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {

        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;

        if (isNaN(page) || page <= 0)
            return ResponseHandler.sendError(res, "Invalid page number", 400);
        if (isNaN(limit) || limit <= 0 || limit > 100)
            return ResponseHandler.sendError(res, "Invalid limit (max 100)", 400);

        const keyword =
            typeof req.query.search === "string" ? req.query.search : undefined;

        const timeZone =
            typeof req.query.timeZone === "string" ? req.query.timeZone : undefined;

        const latitude =
            typeof req.query.lat === "string" ? parseFloat(req.query.lat) : undefined;
        const longitude =
            typeof req.query.lng === "string" ? parseFloat(req.query.lng) : undefined;
        const radiusKm =
            typeof req.query.radiusKm === "string" ? parseFloat(req.query.radiusKm) : undefined;

        if (latitude !== undefined && isNaN(latitude))
            return ResponseHandler.sendError(res, "Invalid latitude", 400);
        if (longitude !== undefined && isNaN(longitude))
            return ResponseHandler.sendError(res, "Invalid longitude", 400);
        if ((latitude === undefined) !== (longitude === undefined))
            return ResponseHandler.sendError(res, "Both lat and lng are required for geo search", 400);

        const data = await branchList({ keyword, timeZone, latitude, longitude, radiusKm, page, limit });

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
