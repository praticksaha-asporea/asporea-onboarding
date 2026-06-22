import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import { DocumentModel } from "@/lib/models/Document.model";
import ResponseHandler from "@/lib/utils/responseUtil";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    const user = token ? await verifyToken(token) : null;

    const { leadId, documents, position } = req.body;

    if (!leadId || !documents || !position) {
      return ResponseHandler.sendError(
        res,
        "Lead and documents and applying position are required",
        400,
      );
    }

    const savedDocs = [];

    if (documents && documents.length > 0) {
      for (const doc of documents) {
        if (doc.typeId && doc.uploadId) {
          const newDoc = await DocumentModel.create({
            leadId,
            userId: user?.id,
            typeId: doc.typeId,
            uploadId: doc.uploadId,
            status: "uploaded",
          });
          savedDocs.push(newDoc);
        }
      }
    }

    const LeadModel = mongoose.models.Lead || mongoose.model("Lead");

    await LeadModel.findByIdAndUpdate(leadId, {
      status: "doc_submitted",
      "documents.status": "uploaded",
      "documents.submittedOn": new Date(),
      "documents.position": position,
    });

    return ResponseHandler.sendSuccess(
      res,
      savedDocs,
      "Documents mapped successfully",
    );
  } catch (error: any) {
    return ResponseHandler.sendError(res, error.message || "Save Error", 500);
  }
}
