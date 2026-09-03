import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import ResponseHandler from "@/lib/utils/responseUtil";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { Position } from "@/lib/models/Position.model";

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
      { projection: { status: 1, documents: 1, experience: 1, offeredPosition: 1, inqForPosition: 1 } }
    );
    if (lead) {
      const positionIds = [
        lead.offeredPosition,
        lead.inqForPosition,
      ]
        .filter(
          (id) => id && mongoose.Types.ObjectId.isValid(id.toString())
        )
        .map((id) => new mongoose.Types.ObjectId(id.toString()));

      const positions = await Position.find(
        { _id: { $in: positionIds } },
        { title: 1 }
      ).lean();

      const positionMap = new Map(
        positions.map((p) => [p._id.toString(), p.title])
      );

      lead.offeredPosition = lead.offeredPosition
        ? positionMap.get(lead.offeredPosition.toString()) ?? ""
        : "";

      lead.inqForPosition = lead.inqForPosition
        ? positionMap.get(lead.inqForPosition.toString()) ?? ""
        : "";
    }



    if (!lead) return ResponseHandler.sendError(res, "Lead not found", 404);

    const documentCount = await db.collection("documents").countDocuments({
      leadId: new mongoose.Types.ObjectId(leadId as string)
    });

    if (documentCount === 0) {
      return ResponseHandler.sendSuccess(res, {
        status: lead.status,
        documentStatus: "na",
        realDocsCount: 0,
        offeredPosition: lead.offeredPosition || null,
        inqForPosition: lead.inqForPosition || null
      }, "No documents found");
    }

    return ResponseHandler.sendSuccess(
      res,
      {
        status: lead.status,
        documentStatus: lead.documents?.status,
        realDocsCount: documentCount,
        experienceType: lead.experience?.type || null,
        offeredPosition: lead.offeredPosition || null,
        inqForPosition: lead.inqForPosition || null
      },
      "Status fetched"
    )
  } catch (error: any) {
    console.error("STATUS API ERROR:", error)
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
