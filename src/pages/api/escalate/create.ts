import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
    getTokenFromHeader,
    verifyToken,
} from "@/lib/middleware/auth.middleware";
import { createEscalationSchema } from "@/lib/validation/escalateValidation";
import { createEscalationService } from "@/lib/services/escalate/escalate.service";
import { createLeadLogService } from "@/lib/services/leadActivity/leadLog.service";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await connectToDatabase();
    if (req.method !== "POST")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);
        const authUser = await verifyToken(token);
        if (authUser?.role !== "tac" && authUser?.role !== "tac_head" && authUser?.role !== "foe")
            throw new ApiError("Unauthorized user", 401);

        const { error } = createEscalationSchema.validate(req.body);
        if (error)
            throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

        const data = await createEscalationService(req.body);


        await createLeadLogService(
            String(req.body.leadId),
            "ESCALATE_BY_" + authUser?.role?.toUpperCase(),
            "Escalated for " + req.body.reason,
            req.body.fromId
        );

        return ResponseHandler.sendSuccess(
            res,
            data,
            "Escalated successfully",
        );
    } catch (error: unknown) {

        if (error instanceof ApiError)
            return ResponseHandler.sendError(res, error.message, error.statusCode);
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}
