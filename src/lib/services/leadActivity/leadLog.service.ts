import mongoose from "mongoose";
import { LeadLog } from "@/lib/models/LeadLog.model";
import "../../models/User.model"
import { ApiError } from "@/lib/error/api.error";
export const createLeadLogService = async (
  leadId: string,
  actionType: string,
  actionNote: string,
  actionBy?: string,
  eventDate?: Date
) => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID is required", 400);
  }
  if (!actionType || !actionNote) {
    throw new ApiError("actionType and actionNote are required", 400);
  }

  // if actionBy is provided, validate it otherwise it will be considered as SYSTEM triggered log

  if (actionBy && !mongoose.Types.ObjectId.isValid(actionBy)) {
    throw new ApiError("Valid actionBy User ID is required", 400);
  }
  const triggeredBy = actionBy ? "USER" : "SYSTEM";


  const newLog = await LeadLog.create({
    leadId: new mongoose.Types.ObjectId(leadId),
    actionType,
    actionNote,
    triggeredBy,

    //if actionBy is provided, convert it to ObjectId, otherwise don't include it in the document

    ...(actionBy && { actionBy: new mongoose.Types.ObjectId(actionBy) }),
    eventDate: eventDate,
  });

  return await LeadLog.findById(newLog._id).populate(
    "actionBy",
    "firstName lastName email"
  );
};

export const getLeadLogsService = async (leadId: string) => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID query parameter is required", 400);
  }

  return await LeadLog.find({ leadId: new mongoose.Types.ObjectId(leadId) })
    .populate("actionBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();
};

export const deleteLeadLogService = async (logId: string, userRole: string) => {
  const isAdmin = ["admin", "tac_head"].includes(userRole);
  if (!isAdmin) {
    throw new ApiError("Only admins can delete system logs", 403);
  }

  if (!logId || !mongoose.Types.ObjectId.isValid(logId)) {
    throw new ApiError("Valid Log ID is required", 400);
  }

  const logDoc = await LeadLog.findByIdAndDelete(logId);
  if (!logDoc) throw new ApiError("Log entry not found", 404);

  return { logId };
};