import mongoose from "mongoose";
import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { Assignment } from "@/lib/models/Assignment.model";
import { DocumentModel } from "@/lib/models/Document.model";
import { Lead } from "@/lib/models/Lead.model";
import { updateAssessDocumentSchema } from "@/lib/validation/tacValidation";

export interface IUpdateAssessDocumentPayload {
  id?: string;
  status?: "verified" | "rejected" | "awaiting_approval";
  remarks?: string;
  [key: string]: any;
}

export const updateAssessDocumentService = async (
  payload: IUpdateAssessDocumentPayload,
  authUser: { id: string; role: string },
) => {
  if (authUser?.role !== "tac") {
    throw new ApiError("TAC access required", 403);
  }

  const { error, value } = updateAssessDocumentSchema.validate(payload);
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw new ApiError(message, 400);
  }

  const { id, status, remarks } = value;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid assignment ID", 400);
  }

  await connectToDatabase();

  // Verify the assignment belongs to this TAC
  const assignment = await Assignment.findOne({
    _id: id,
    assignedTo: new mongoose.Types.ObjectId(authUser.id),
  });

  if (!assignment) {
    throw new ApiError("Assignment not found or not assigned to you", 404);
  }

  if (!assignment?.token?.number && assignment?.schedule?.method === "off") {
    throw new ApiError("Token not generated yet", 404);
  }

  let leadUpdate: any = {
    status: `doc_${status}`,
    "documents.actionBy": new mongoose.Types.ObjectId(authUser.id),
  };

  if (status === "verified" || status === "rejected") {
    await DocumentModel.updateMany(
      { leadId: assignment?.leadId },
      { $set: { status: status } },
    );

    leadUpdate = {
      "documents.status": status,
      status: `doc_${status}`,
      "documents.actionBy": new mongoose.Types.ObjectId(authUser.id),
    };

    if (status === "rejected" && remarks) {
      leadUpdate["documents.remarks"] = remarks;
    }
  } else if (status === "awaiting_approval") {
    // TL Verify - request flow
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    assignment?.leadId,
    { $set: leadUpdate },
    { returnDocument: "after", runValidators: true },
  );

  await Assignment.findByIdAndUpdate(id, {
    $set: { attended: true },
  });

  return updatedLead;
};
