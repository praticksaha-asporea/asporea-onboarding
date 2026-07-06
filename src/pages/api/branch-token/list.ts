import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { applyCors } from "@/lib/cors";
import { counterWiseTokens } from "@/lib/services/guest/branch-token.service";
import { tokenCounter } from "@/Types/ApiResponse/tokenRes.types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    if (req.method !== "POST")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {

        const branchId = req.query.branchId as string;
        const counters = req.body.counters as tokenCounter[];
        const data = await counterWiseTokens({ branchId, counters });

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
