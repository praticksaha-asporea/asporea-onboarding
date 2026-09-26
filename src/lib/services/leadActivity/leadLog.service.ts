import mongoose from "mongoose";
import { LeadLog } from "@/lib/models/LeadLog.model";
import "../../models/User.model"
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
    "firstName lastName email role"
  );
};

export const getLeadLogsService = async (leadId: string) => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID query parameter is required", 400);
  }

  return await LeadLog.find({ leadId: new mongoose.Types.ObjectId(leadId) })
    .populate("actionBy", "firstName lastName email role")
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


const encodeCursor = (createdAt: Date, id: mongoose.Types.ObjectId) =>
  Buffer.from(`${createdAt.toISOString()}_${id.toString()}`).toString("base64");

const decodeCursor = (cursor: string) => {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const [createdAtStr, id] = decoded.split("_");
  const createdAt = new Date(createdAtStr);

  if (isNaN(createdAt.getTime()) || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid cursor", 400);
  }
  return { createdAt, id: new mongoose.Types.ObjectId(id) };
};


const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
export const getLeadLogsByCandidateService = async ({
  leadId,
  cursor,
  limit,
}: {
  leadId: string;
  cursor?: string | null;
  limit?: number | string;
}) => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID query parameter is required", 400);
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const query: {
    leadId: mongoose.Types.ObjectId;
    $or?: Array<
      | { createdAt: { $lt: Date } }
      | {
        createdAt: Date;
        _id: { $lt: mongoose.Types.ObjectId };
      }
    >;
  } = {
    leadId: new mongoose.Types.ObjectId(leadId),
  };

  // Guard against frontend accidentally sending
  // the string "null"/"undefined"
  if (cursor && cursor !== "null" && cursor !== "undefined") {
    const { createdAt, id } = decodeCursor(cursor);

    query.$or = [
      {
        createdAt: { $lt: createdAt },
      },
      {
        createdAt,
        _id: { $lt: id },
      },
    ];
  }

  const rows = await LeadLog.find(query)
    // .populate("leadId", "fullName")
    .populate("actionBy", "firstName lastName email role")
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .lean();

  const hasMore = rows.length > safeLimit;

  const page = hasMore ? rows.slice(0, safeLimit) : rows;

  const last = page[page.length - 1];

  const nextCursor =
    hasMore && last
      ? encodeCursor(last.createdAt, last._id)
      : null;

  return {
    data: page,
    nextCursor,
    hasMore,
  };
};