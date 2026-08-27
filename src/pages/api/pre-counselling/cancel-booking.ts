import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { cancelPreBooking } from "@/lib/services/PreCounselling/preCounselling.service";
import ResponseHandler from "@/lib/utils/responseUtil";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    await connectToDatabase();

    if (req.method !== "POST") {
        return ResponseHandler.sendError(res, "Method not allowed", 405);
    }

    try {
        const data = await cancelPreBooking(req.body);
        return ResponseHandler.sendSuccess(
            res,
            data,
            "Cancelled successfully",
        );
    } catch (error: unknown) {
        console.log(error)
        if (error instanceof ApiError) {
            return ResponseHandler.sendError(res, error.message, error.statusCode);
        }
        console.error("Cancel API Error:", error);
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }


}