import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { getTacCandidates, getTacKpis } from "@/lib/services/tac/dashboard.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac" && authUser.role !== "foe") throw new ApiError("TAC or FOE access required", 403);

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    if (isNaN(page) || page <= 0)
      return ResponseHandler.sendError(res, "Invalid page number", 400);
    if (isNaN(limit) || limit <= 0 || limit > 100)
      return ResponseHandler.sendError(res, "Invalid limit (max 100)", 400);

    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const experience = typeof req.query.experience === "string" ? req.query.experience : undefined;
    const includeKpis = req.query.kpis === "true";

    const [candidates, kpis] = await Promise.all([
      getTacCandidates({ userId: authUser.id, role: authUser.role, search, status, experience, page, limit }),
      includeKpis ? getTacKpis(authUser.id, authUser.role) : Promise.resolve(null),
    ]);

    return ResponseHandler.sendSuccess(res, { ...candidates, kpis }, "Candidates fetched");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
