import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
    updateCountryService,
    deleteCountryService,
} from "../../../../lib/services/admin/country.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);
        await verifyToken(token);

        const { id } = req.query;

        if (req.method === "PUT") {
            const { name, code, isActive } = req.body;
            const result = await updateCountryService(id as string, { name, code, isActive });
            return ResponseHandler.sendSuccess(res, result, "Country updated successfully");
        }

        if (req.method === "DELETE") {
            const result = await deleteCountryService(id as string);
            return ResponseHandler.sendSuccess(res, result, "Country deleted successfully");
        }

        return ResponseHandler.sendError(res, "Method not allowed", 405);
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
        }
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}