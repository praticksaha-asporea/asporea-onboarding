import mongoose from "mongoose";
import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { Assignment } from "@/lib/models/Assignment.model";
import { Lead } from "@/lib/models/Lead.model";
import { BranchTokenModel } from "@/lib/models/BranchToken.model";
import { updateAssessAssignmentSchema } from "@/lib/validation/tacAssignmentValidation";

export interface IUpdateAssessAssignmentPayload {
  assignmentId?: string;
  status?:
    | "assigned"
    | "contacted"
    | "na"
    | "queued"
    | "completed"
    | "rejected"
    | "not_responded";
  [key: string]: any;
}

export const updateAssessAssignmentService = async (
  payload: IUpdateAssessAssignmentPayload,
  authUser: { id: string; role: string },
) => {
  if (authUser?.role !== "tac") {
    throw new ApiError("TAC access required", 403);
  }

  const { error, value } = updateAssessAssignmentSchema.validate(payload);
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw new ApiError(message, 400);
  }

  const { assignmentId, status } = value;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new ApiError("Invalid assignment ID", 400);
  }

  await connectToDatabase();

  // Verify the assignment belongs to this TAC
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    assignedTo: new mongoose.Types.ObjectId(authUser.id),
  });

  if (!assignment) {
    throw new ApiError("Assignment not found or not assigned to you", 404);
  }

  if (!assignment?.token?.number && assignment?.schedule?.method === "off") {
    throw new ApiError("Token not generated yet", 404);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const assignmentAnyQueued: any = await Assignment.findOne({
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
    if (assignmentAnyQueued.leadId?.status !== "doc_awaiting_approval") {
      throw new ApiError(
        `You already have an assignment in ${assignmentAnyQueued.status} status [ ${assignmentAnyQueued.leadId?.inqNo} ]. \r\n Please complete / reject update it first, or ask the FOE to reschedule it.`,
        400,
      );
    }
  }

  const update: Record<string, any> = {
    ...(status !== undefined && { status }),
  };

  if (status === "completed" || status === "rejected") {
    update["attended"] = true;
  } else if (status === "not_responded") {
    update["attended"] = false;
  }

  const updated = await Assignment.findByIdAndUpdate(
    assignmentId,
    { $set: update },
    { returnDocument: "after", runValidators: true },
  ).lean();

  const updatableStatus: Record<string, string> = {
    assigned: "assess_scheduled",
    contacted: "assess_contacted",
    queued: "assess_queued",
    not_responded: "assess_not_responded",
    completed: "assess_completed",
    rejected: "assess_rejected",
  };

  if (status && updatableStatus[status]) {
    await Lead.findByIdAndUpdate(
      assignment?.leadId,
      { $set: { status: updatableStatus[status] } },
      { returnDocument: "after", runValidators: true },
    );

    if (updatableStatus[status] === "assess_queued") {
      if (updated?.token?.number) {
        await BranchTokenModel.findOneAndUpdate(
          { tokenNo: updated.token.number },
          { $set: { status: "queued" } },
          { returnDocument: "after", upsert: true, runValidators: true },
        ).lean();
      }
    } else if (
      updatableStatus[status] === "assess_completed" ||
      updatableStatus[status] === "assess_rejected"
    ) {
      if (
        updated?.token?.number !== null &&
        updated?.token?.number !== undefined
      ) {
        await BranchTokenModel.findOneAndUpdate(
          { tokenNo: updated.token.number },
          { $set: { status: "finished" } },
          { returnDocument: "after", upsert: true, runValidators: true },
        ).lean();
      }
    }
  }

  return updated;
};
