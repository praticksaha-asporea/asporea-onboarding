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
import { BranchTokenModel } from "@/lib/models/BranchToken.model";


const updateAssessAssignmentSchema = Joi.object({
  assignmentId: Joi.string()
    .hex()
    .length(24)
    .required(),

  status: Joi.string()
    .valid(
      "assigned",
      "contacted",
      "na",
      "queued",
      "completed",
      "rejected",
      "not_responded"
    )
    .optional()
})
  .options({
    abortEarly: false,
    allowUnknown: true, // IMPORTANT for multipart/form-data
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
    const { error, value } = updateAssessAssignmentSchema.validate(body);

    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { assignmentId, status } = value;

    if (!mongoose.Types.ObjectId.isValid(assignmentId))
      throw new ApiError("Invalid assignment ID", 400);

    // Verify the assignment belongs to this TAC
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      assignedTo: new mongoose.Types.ObjectId(authUser.id),
    });
    if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);
    if (!assignment?.token?.number && assignment?.schedule?.method == "off") throw new ApiError("Token not generated yet", 404)

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const assignmentAnyQueued = await Assignment.findOne({
      assignedTo: authUser.id,
      status: { $in: ["queued", "contacted"] },
      "schedule.date": {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate({
        path: "leadId",
        select: "inqNo status",
      })
      .lean();

    if (assignmentAnyQueued && status === "queued") {

      if (assignmentAnyQueued.leadId.status !== "doc_awaiting_approval")
        throw new ApiError(
          `You already have an assignment in ${assignmentAnyQueued.status} status [ ${assignmentAnyQueued.leadId?.inqNo} ]. \r\n Please complete / reject update it first, or ask the FOE to reschedule it.`,
          400
        );
    }


    // need to work here for update fields
    const update: Record<string, any> = {
      ...(status !== undefined && { status })
    };

    if (status === "completed" || status === "rejected") {
      update['attended'] = true;
    }
    else if (status === "not_responded") {
      update['attended'] = false;
    }

    const updated = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: update },
      { returnDocument: "after", runValidators: true },
    ).lean();
    // console.log(update,updated,assignmentId,18444);

    const updatableStatus: Record<string, string> = {
      assigned: "assess_scheduled",
      contacted: "assess_contacted",
      queued: "assess_queued",
      not_responded: "assess_not_responded",
      completed: "assess_completed",
      rejected: "assess_rejected",
    };
    if (updatableStatus) {

      await Lead.findByIdAndUpdate(
        assignment?.leadId,
        { $set: { status: updatableStatus?.[status] } },
        { returnDocument: "after", runValidators: true }
      );
      if (updatableStatus?.[status] === "assess_queued") {

        // only work when offline - later
        await BranchTokenModel.findOneAndUpdate(
          { tokenNo: updated?.token?.number },
          { $set: { status: 'queued' } },
          { returnDocument: 'after', upsert: true, runValidators: true },
        ).lean();

      }
      else if (updatableStatus?.[status] === "assess_completed" || updatableStatus?.[status] === "assess_rejected") {
        // only work when offline - later
        if (updated?.token?.number !== null)

          await BranchTokenModel.findOneAndUpdate(
            { tokenNo: updated?.token?.number },
            { $set: { status: 'finished' } },
            { returnDocument: 'after', upsert: true, runValidators: true },
          ).lean();
        //email/ notification for prescription wlll add later

      }
    }

    return ResponseHandler.sendSuccess(res, updated, "Assignment updated");
  } catch (error: unknown) {

    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
