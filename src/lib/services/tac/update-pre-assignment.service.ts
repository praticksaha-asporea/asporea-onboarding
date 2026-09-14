import mongoose from "mongoose";
import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { Assignment } from "@/lib/models/Assignment.model";
import { Lead } from "@/lib/models/Lead.model";
import { BranchTokenModel } from "@/lib/models/BranchToken.model";
import { uploadFileService } from "@/lib/services/upload.service";
import { UploadResult } from "@/Types/Frontend_Payload/document.types";
import { updatePreAssignmentSchema } from "@/lib/validation/preAssignmentValidation";

export interface IUpdatePreAssignmentPayload {
  assignmentId?: string;
  preStatus?: string;
  status?: string;
  additionalDetails?: string;
  specificNotes?: string;
  advice?: string;
  offeredPosition?: string;
  [key: string]: any;
}

export const updatePreAssignmentService = async (
  payload: IUpdatePreAssignmentPayload,
  authUser: { id: string; role: string },
  files?: any
) => {
  if (authUser?.role !== "tac") {
    throw new ApiError("TAC access required", 403);
  }

  const { error, value } = updatePreAssignmentSchema.validate(payload);
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw new ApiError(message, 400);
  }

  const assignmentId = value.assignmentId;
  const status = value.status || value.preStatus;
  const { additionalDetails, specificNotes, advice, offeredPosition } = value;

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

  let result: UploadResult | null = null;
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
        400
      );
    }
  }

  if (files?.resume) {
    result = await uploadFileService({
      file: files.resume,
      userId: authUser?.id,
    });
  }

  const update: Record<string, any> = {
    ...(status !== undefined && { status }),
    pre: {
      ...(additionalDetails !== undefined && { additionalDetails }),
      ...(specificNotes !== undefined && { specificNotes }),
      ...(advice !== undefined && { advice }),
      ...(result?.uploadId !== undefined && { initialCV: result.uploadId }),
    },
  };

  if (status === "completed" || status === "rejected") {
    update["attended"] = true;
  } else if (status === "not_responded") {
    update["attended"] = false;
  }

  const updated = await Assignment.findByIdAndUpdate(
    assignmentId,
    { $set: update },
    { returnDocument: "after", runValidators: true }
  ).lean();

  const updatableStatus: Record<string, string> = {
    assigned: "pre_scheduled",
    contacted: "pre_contacted",
    queued: "pre_queued",
    not_responded: "pre_not_responded",
    completed: "pre_completed",
    rejected: "pre_rejected",
  };

  if (status && updatableStatus[status]) {
    await Lead.findByIdAndUpdate(
      assignment?.leadId,
      { $set: { status: updatableStatus[status], offeredPosition } },
      { returnDocument: "after", runValidators: true }
    );

    if (updatableStatus[status] === "pre_queued") {
      if (updated?.token?.number) {
        await BranchTokenModel.findOneAndUpdate(
          { tokenNo: updated.token.number },
          { $set: { status: "queued" } },
          { returnDocument: "after", upsert: true, runValidators: true }
        ).lean();
      }
    } else if (
      updatableStatus[status] === "pre_completed" ||
      updatableStatus[status] === "pre_rejected"
    ) {
      if (updated?.token?.number !== null && updated?.token?.number !== undefined) {
        await BranchTokenModel.findOneAndUpdate(
          { tokenNo: updated.token.number },
          { $set: { status: "finished" } },
          { returnDocument: "after", upsert: true, runValidators: true }
        ).lean();
      }
    }
  }

  return updated;
};