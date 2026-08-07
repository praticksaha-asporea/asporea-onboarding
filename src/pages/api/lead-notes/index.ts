import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
  createLeadNoteService,
  getLeadNotesService,
  deleteLeadNoteService,
} from "@/lib/services/leadActivity/leadNote.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);


    if (req.method === "POST") {
      const { leadId, note } = req.body;
      const result = await createLeadNoteService(
        leadId,
        note,
        authUser.id,
        authUser.role
      );
      return ResponseHandler.sendSuccess(res, result, "Note added successfully", 201);
    }


    if (req.method === "GET") {
      const { leadId } = req.query;
      const result = await getLeadNotesService(leadId as string);
      return ResponseHandler.sendSuccess(res, result, "Lead notes fetched successfully");
    }


    if (req.method === "DELETE") {
      const { noteId } = req.query;
      const result = await deleteLeadNoteService(
        noteId as string,
        authUser.id,
        authUser.role
      );
      return ResponseHandler.sendSuccess(res, result, "Note deleted successfully");
    }

    return ResponseHandler.sendError(res, "Method not allowed", 405);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}