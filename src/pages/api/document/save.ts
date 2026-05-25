import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import { DocumentModel } from "@/lib/models/Document.model";
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
  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    const user = token ? await verifyToken(token) : null;

    const { leadId, documents } = req.body; // documents = [{ typeId: "...", uploadId: "..." }, { typeId: "...", uploadId: "..." }]

    if (!leadId || !documents || !documents.length) {
      return ResponseHandler.sendError(
        res,
        "LeadId and documents array are required",
        400,
      );
    }

    const savedDocs = [];
    for (const doc of documents) {
      const newDoc = await DocumentModel.create({
        leadId,
        userId: user?.id,
        typeId: doc.typeId,
        uploadId: doc.uploadId,
        status: "uploaded",
      });
      savedDocs.push(newDoc);
    }

    return ResponseHandler.sendSuccess(
      res,
      savedDocs,
      "Documents mapped successfully",
    );
  } catch (error: any) {
    return ResponseHandler.sendError(res, error.message || "Save Error", 500);
  }
}
