import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { DocumentModel } from "@/lib/models/Document.model";
import mongoose from "mongoose";
import User from "@/lib/models/User.model";
import { createLeadLogService } from "../leadActivity/leadLog.service";

export interface IDocumentItem {
  typeId: string;
  uploadId: string;
}

export interface ISubmitDocumentsPayload {
  leadId: string;
  position: string;
  documents: IDocumentItem[];
}
 
export const submitDocumentsService = async (
  payload: ISubmitDocumentsPayload,
  userId?: string,
) => {
  const { leadId, documents, position } = payload;

  if (!leadId || !documents || !position) {
    throw new ApiError(
      "Lead and documents and applying position are required",
      400,
    );
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new ApiError("At least one document is required", 400);
  }

  await connectToDatabase();

  const savedDocs = [];

  for (const doc of documents) {
    if (doc.typeId && doc.uploadId) {
      const newDoc = await DocumentModel.create({
        leadId,
        userId,
        typeId: doc.typeId,
        uploadId: doc.uploadId,
        status: "uploaded",
      });
      savedDocs.push(newDoc);
    }
  }

  const LeadModel = mongoose.models.Lead || mongoose.model("Lead");

  const updatedLead = await LeadModel.findByIdAndUpdate(leadId, {
    status: "doc_submitted",
    "documents.status": "uploaded",
    "documents.submittedOn": new Date(),
    "documents.position": position,
  });

  if (!updatedLead) {
    throw new ApiError("Target lead record not found", 404);
  }

 let roleLabel = "CANDIDATE";
  const performerId = userId || String(updatedLead.createdBy?.id || updatedLead.createdBy);

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const actionUser = await User.findById(userId).select("role").lean();
    if (actionUser) {
      const rawRole = actionUser.role || "user";
      if (rawRole === "user") {
        roleLabel = "CANDIDATE";
      } else if (rawRole === "tac_head") {
        roleLabel = "TAC_HEAD";
      } else {
        roleLabel = rawRole.toUpperCase();
      }
    }
  }

  const actionType = `DOCUMENT_SUBMITTED_BY_${roleLabel}`;
  const docCount = savedDocs.length;
  const actionNote = `${docCount} document(s) uploaded and submitted for position verification`;

  await createLeadLogService(
    String(leadId),
    actionType,
    actionNote,
    performerId
  );

  return savedDocs;
};
