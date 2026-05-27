import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import ResponseHandler from "@/lib/utils/responseUtil";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (token) await verifyToken(token);
    const { leadId } = req.query;
    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId as string)) {
      return ResponseHandler.sendError(res, "Valid leadId is required", 400);
    }

    const db = mongoose.connection.db;
    if (!db) {
      return ResponseHandler.sendError(res, "Database connection not established", 500);
    }

    const lead = await db.collection("leads").findOne(
      { _id: new mongoose.Types.ObjectId(leadId as string) },
      { projection: { status: 1, documents: 1, experience: 1 } }  
    );

    

    if (!lead) return ResponseHandler.sendError(res, "Lead not found", 404);

    const documentCount = await db.collection("documents").countDocuments({ 
      leadId: new mongoose.Types.ObjectId(leadId as string) 
    });

    if (documentCount === 0) {
      return ResponseHandler.sendSuccess(res, {
        status: "pre_scheduled",  
        documentStatus: "na",
        realDocsCount: 0
      }, "No documents found");
    }

    return ResponseHandler.sendSuccess(
      res,
      {
        status: lead.status,
        documentStatus: lead.documents?.status,
        realDocsCount: documentCount,
        experienceType: lead.experience?.type || null
      },
      "Status fetched"
    )
  } catch (error: any) {
    console.error("STATUS API ERROR:", error)
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
