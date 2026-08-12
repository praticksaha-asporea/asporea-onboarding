import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
  createCountryService,
  getCountriesService,
} from "../../../../lib/services/admin/country.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    await verifyToken(token);

    if (req.method === "POST") {
      const { name, code } = req.body;
      const result = await createCountryService(name, code);
      return ResponseHandler.sendSuccess(res, result, "Country created successfully", 201);
    }

    if (req.method === "GET") {
      const { active } = req.query;
      const onlyActive = active === "true";
      const result = await getCountriesService(onlyActive);
      return ResponseHandler.sendSuccess(res, result, "Countries fetched successfully");
    }

    return ResponseHandler.sendError(res, "Method not allowed", 405);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}