import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { createToken } from "@/lib/services/guest/branch-token.service";
import { guestTokenSchema } from "@/lib/validation/authValidation";
import { applyCors } from "@/lib/cors";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (applyCors(req, res)) return;

    await connectToDatabase();
    if (req.method !== "POST")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {

        const { error } = guestTokenSchema.validate(req.body);
        if (error)
            throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

        const data = await createToken(req.body);
        return ResponseHandler.sendSuccess(
            res,
            data,
            "Token Generated successfully",
        );
    } catch (error: unknown) {
        console.log(error,18944);
        
        if (error instanceof ApiError)
            return ResponseHandler.sendError(res, error.message, error.statusCode);
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}
