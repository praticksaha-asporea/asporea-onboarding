import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
    createLeadLogService,
    getLeadLogsService,
    deleteLeadLogService,
    getLeadLogsByCandidateService,
} from "@/lib/services/leadActivity/leadLog.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);
        const authUser = await verifyToken(token);


        if (req.method === "POST") {
            const { leadId, actionType, actionNote, eventDate } = req.body;
            const result = await createLeadLogService(
                leadId,
                actionType,
                actionNote,
                authUser.id,
                eventDate
            );
            return ResponseHandler.sendSuccess(res, result, "Log recorded successfully", 201);
        }


        if (req.method === "GET") {
            const { leadId, bycandidate } = req.query;
            if (!bycandidate) {
                const result = await getLeadLogsService(leadId as string);
                return ResponseHandler.sendSuccess(res, result, "Lead logs fetched successfully");
            }
            else {
                const { leadId, cursor, limit, bycandidate } = req.query;

                const result = await getLeadLogsByCandidateService({
                    leadId: leadId as string,
                    cursor: (cursor as string) ?? null,
                    limit: limit as string,
                });

                return ResponseHandler.sendSuccess(res, result, "Lead logs fetched successfully");
            }
        }

        if (req.method === "DELETE") {
            const { logId } = req.query;
            const result = await deleteLeadLogService(logId as string, authUser.role);
            return ResponseHandler.sendSuccess(res, result, "Log entry deleted successfully");
        }

        return ResponseHandler.sendError(res, "Method not allowed", 405);
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
        }
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}