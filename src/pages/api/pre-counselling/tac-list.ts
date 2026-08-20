import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { getTacListService } from "@/lib/services/PreCounselling/getTacList.service";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    if (req.method !== "GET")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {

        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);

        await verifyToken(token);


        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
        const search = typeof req.query.search === "string" ? req.query.search : "";
        const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
        const mode = (["online", "offline", "both"].includes(req.query.mode as string)
            ? req.query.mode
            : undefined) as "online" | "offline" | "both" | undefined;


        const data = await getTacListService({
            page,
            limit,
            search,
            branchId,
            mode,
        });

        return ResponseHandler.sendSuccess(res, data, "TAC list fetched successfully");
    } catch (error: unknown) {
        if (error instanceof ApiError)
            return ResponseHandler.sendError(
                res,
                error.message,
                error.statusCode,
                error.data
            );
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}