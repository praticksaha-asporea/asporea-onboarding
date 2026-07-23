import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Assignment } from "@/lib/models/Assignment.model";
import mongoose from "mongoose";
import Joi from "joi";
import { normalizeFormFields, parseForm } from "@/lib/utils/parseForm";
import { Lead } from "@/lib/models/Lead.model";
import { DocumentModel } from "@/lib/models/Document.model";


const updateAssessDocumentSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required(),

  status: Joi.string()
    .valid(
      "verified",
      "rejected",
      "awaiting_approval"
    )
    .optional(),
  remarks: Joi.string().allow("", null).optional()
})
  .options({
    abortEarly: false,
    allowUnknown: true,
  });
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;
  await connectToDatabase();

  if (req.method !== "PATCH" && req.method !== "PUT")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac") throw new ApiError("TAC access required", 403);
    const { fields } = await parseForm(req);
    const body = normalizeFormFields(
      fields as any
    );
    const { error, value } = updateAssessDocumentSchema.validate(body);

    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { id, status, remarks } = value;

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError("Invalid assignment ID", 400);

    // Verify the assignment belongs to this TAC
    const assignment = await Assignment.findOne({
      _id: id,
      assignedTo: new mongoose.Types.ObjectId(authUser.id),
    });
    if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);
    if (!assignment?.token?.number && assignment?.schedule?.method == "off") throw new ApiError("Token not generated yet", 404)

    let leadUpdate: any = { status: `doc_${status}`, "documents.actionBy": new mongoose.Types.ObjectId(authUser.id) };

    if (status === "verified" || status === "rejected") {

      await DocumentModel.updateMany(
        { leadId: assignment?.leadId },
        { $set: { status: status } }
      );
      leadUpdate = {
        "documents.status": status, status: `doc_${status}`, "documents.actionBy": new mongoose.Types.ObjectId(authUser.id)
      };

      if (status === "rejected" && remarks) {
        leadUpdate["documents.remarks"] = remarks;
      }
    }
    else if (status === "awaiting_approval") {
      // TL Verify - request
    }
    // console.log(leadUpdate, 498441);

    const updatedLead = await Lead.findByIdAndUpdate(
      assignment?.leadId,
      { $set: leadUpdate }, //here
      { returnDocument: "after", runValidators: true }
    );
    // console.log(updatedLead, 22222);
    await Assignment.findByIdAndUpdate(
      id,
      { $set: { attended: true } },
    )
    return ResponseHandler.sendSuccess(res, updatedLead, "Documents updated");
  } catch (error: unknown) {

    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
