import { ApiError } from "@/lib/error/api.error";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Lead } from "@/lib/models/Lead.model";
import { Assignment } from "@/lib/models/Assignment.model";
import User from "@/lib/models/User.model";
import "@/lib/models/Upload.model";
import { Reminder } from "@/lib/models/Reminder.model";
import {
  getRemindersQuerySchema,
  reminderIdParamSchema,
} from "@/lib/validation/reminderValidation";
import mongoose from "mongoose";

export const getReminderTargetsService = async (
  status: string,
  filterUserId: string,
) => {
  if (!status) {
    throw new ApiError("Status parameter is required", 400);
  }

  const shiftInfos = await EmployeeBranchShiftModel.find({
    employeeId: new mongoose.Types.ObjectId(filterUserId),
  }).lean();

  const assignedBranchIds = [
    ...new Set(shiftInfos.map((s) => s.branchId?.toString()).filter(Boolean)),
  ];

  if (assignedBranchIds.length === 0) {
    throw new ApiError(
      "Your branch assignment data is invalid or corrupted. Please contact Admin.",
      403,
    );
  }

   const matchQuery: any = {
    status: status,
    "preferences.branchId": {
      $in: assignedBranchIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  };

   const leads = await Lead.find(matchQuery)
    .populate({
      path: "preferences.consultantId",
      model: User,
      select: "firstName lastName email role profilePic",
      populate: { path: "profilePic", select: "path url" },
    })
    .select("_id inqNo fullName preferences status")
    .lean();

  if (!leads || leads.length === 0) {
    return { candidates: [], tacs: [] };
  }

  const leadIds = leads.map((lead) => lead._id);

  const candidateUsers = await User.find({
    "candidateProfile.leadId": { $in: leadIds },
  })
    .select("candidateProfile profilePic")
    .populate({
      path: "profilePic",
      select: "path url",
    })
    .lean();

  const userPicMap = new Map<string, string>();

 
  for (const u of candidateUsers as any[]) {
    const lId = u.candidateProfile?.leadId?.toString();
    const pic = u.profilePic;
    if (lId && pic) {
      const picPath =
        typeof pic === "string" ? pic : pic.path || pic.url || null;
      if (picPath) userPicMap.set(lId, picPath);
    }
  }

   
  const creatorIds = leads.map((l: any) => l.createdBy?.id).filter(Boolean);
  if (creatorIds.length > 0) {
    const creatorUsers = await User.find({ _id: { $in: creatorIds } })
      .select("profilePic")
      .populate({ path: "profilePic", select: "path url" })
      .lean();

    for (const u of creatorUsers as any[]) {
      const uId = u._id.toString();
      const pic = u.profilePic;
      const picPath =
        typeof pic === "string" ? pic : pic?.path || pic?.url || null;
      if (picPath) {
        leads.forEach((l: any) => {
          const leadIdStr = l._id.toString();
          if (
            l.createdBy?.id?.toString() === uId &&
            !userPicMap.has(leadIdStr)
          ) {
            userPicMap.set(leadIdStr, picPath);
          }
        });
      }
    }
  }

 
  const formattedCandidates = leads.map((lead: any) => ({
    leadId: lead._id,
    inqNo: lead.inqNo || "—",
    fullName: lead.fullName || "—",
    profilePic: userPicMap.get(lead._id.toString()) || null,
  }));

 
  const assignments = await Assignment.find({
    leadId: { $in: leadIds },
    assignedTo: { $ne: null },
  })
    .populate({
      path: "assignedTo",
      model: User,
      select: "firstName lastName email role profilePic",
      populate: { path: "profilePic", select: "path url" },
    })
    .populate({
      path: "leadId",
      model: Lead,
      select: "inqNo fullName",
    })
    .lean();

  const formattedTacs: any[] = [];
  const tacTracker = new Set<string>();
  
  for (const assign of assignments) {
    const tac = assign.assignedTo as any;
    const lead = assign.leadId as any;

    if (tac && tac._id && lead && lead._id) {
      const uniqueKey = `${tac._id.toString()}-${lead._id.toString()}`;

      if (!tacTracker.has(uniqueKey)) {
        tacTracker.add(uniqueKey);
        const tacPicObj = tac.profilePic;
        const tacPicPath =
          typeof tacPicObj === "string"
            ? tacPicObj
            : tacPicObj?.path || tacPicObj?.url || null;

        formattedTacs.push({
          assignmentId: assign._id,
          tacId: tac._id,
          tacName:
            `${tac.firstName || ""} ${tac.lastName || ""}`.trim() || "TAC User",
          profilePic: tacPicPath,
          leadId: lead._id,
          inqNo: lead.inqNo || "—",
        });
      }
    }
  }

  // ── 6. Fallback: Check Direct Consultant in Lead Preferences ───────────────
  for (const lead of leads as any[]) {
    const tac = lead.preferences?.consultantId;
    if (tac && tac._id) {
      const uniqueKey = `${tac._id.toString()}-${lead._id.toString()}`;
      if (!tacTracker.has(uniqueKey)) {
        tacTracker.add(uniqueKey);
        const tacPicObj = tac.profilePic;
        const tacPicPath =
          typeof tacPicObj === "string"
            ? tacPicObj
            : tacPicObj?.path || tacPicObj?.url || null;

        formattedTacs.push({
          assignmentId: null,
          tacId: tac._id,
          tacName:
            `${tac.firstName || ""} ${tac.lastName || ""}`.trim() || "TAC User",
          profilePic: tacPicPath,
          leadId: lead._id,
          inqNo: lead.inqNo || "—",
        });
      }
    }
  }

  return {
    candidates: formattedCandidates,
    tacs: formattedTacs,
  };
};

/**
 * Bulk Create Reminders Service
 */
export interface ICreateBulkReminderPayload {
  candidateReminders?: {
    leadIds: string[];
    heading: string;
    message: string;
  };
  tacReminders?: {
    items: {
      tacId: string;
      leadId: string;
      inqNo: string;
    }[];
    heading: string;
    message: string;
  };
}

export const createBulkRemindersService = async (
  payload: ICreateBulkReminderPayload,
  tacHeadUserId: string,
) => {
  const { candidateReminders, tacReminders } = payload;
  const remindersToInsert: any[] = [];

  if (
    candidateReminders &&
    candidateReminders.leadIds?.length > 0 &&
    candidateReminders.heading &&
    candidateReminders.message
  ) {
    for (const leadId of candidateReminders.leadIds) {
      remindersToInsert.push({
        notifyTo: new mongoose.Types.ObjectId(leadId),
        notifyType: "candidate",
        sentFrom: new mongoose.Types.ObjectId(tacHeadUserId),
        heading: candidateReminders.heading,
        message: candidateReminders.message,
        read: false,
      });
    }
  }

  if (
    tacReminders &&
    tacReminders.items?.length > 0 &&
    tacReminders.heading &&
    tacReminders.message
  ) {
    const tacMap = new Map<string, string[]>();

    for (const item of tacReminders.items) {
      if (!tacMap.has(item.tacId)) {
        tacMap.set(item.tacId, []);
      }
      if (item.inqNo && item.inqNo !== "N/A" && item.inqNo !== "—") {
        const currentInqs = tacMap.get(item.tacId)!;
        if (!currentInqs.includes(item.inqNo)) {
          currentInqs.push(item.inqNo);
        }
      }
    }

    for (const [tacId, inqNos] of tacMap.entries()) {
      const combinedInqNos = inqNos.join(", ");
      const hasInquiries = inqNos.length > 0;

      const formattedHeading = tacReminders.heading.trim();

      const formattedMessage = hasInquiries
        ? `${tacReminders.message.trim()}\n\n📌 Reference Inquiry${inqNos.length > 1 ? "s" : ""}: ${combinedInqNos}`
        : tacReminders.message.trim();

      remindersToInsert.push({
        notifyTo: new mongoose.Types.ObjectId(tacId),
        notifyType: "tac",
        sentFrom: new mongoose.Types.ObjectId(tacHeadUserId),
        heading: formattedHeading,
        message: formattedMessage,
        read: false,
      });
    }
  }

  if (remindersToInsert.length === 0) {
    throw new ApiError("No recipients or reminder content selected", 400);
  }

  const result = await Reminder.insertMany(remindersToInsert);

  return {
    count: result.length,
    message: `${result.length} reminders sent successfully`,
  };
};

// ── 3. Get Reminders List Service (With Filters & Pagination) ────────────────
export interface IGetRemindersQuery {
  page?: number;
  limit?: number;
  read?: string;
  notifyType?: string;
  sentFrom?: string;
  notifyTo?: string;
  search?: string;
}

export const getRemindersListService = async (
  queryParams: IGetRemindersQuery
) => {
  const { error, value } = getRemindersQuerySchema.validate(queryParams);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ApiError(msg, 400);
  }

  const page = Number(value.page) || 1;
  const limit = Number(value.limit) || 10;
  const skip = (page - 1) * limit;

  const matchQuery: Record<string, any> = {};

  if (value.read && value.read !== "all") {
    matchQuery.read = value.read === "true";
  }

  if (value.notifyType && value.notifyType !== "all") {
    matchQuery.notifyType = value.notifyType;
  }

  if (value.sentFrom) {
    matchQuery.sentFrom = new mongoose.Types.ObjectId(value.sentFrom);
  }

  if (value.notifyTo) {
    matchQuery.notifyTo = new mongoose.Types.ObjectId(value.notifyTo);
  }

  if (value.search) {
    matchQuery.$or = [
      { heading: { $regex: value.search, $options: "i" } },
      { message: { $regex: value.search, $options: "i" } },
    ];
  }

  const [reminders, totalCount] = await Promise.all([
    Reminder.find(matchQuery)
      .populate({
        path: "sentFrom",
        model: User,
        select: "firstName lastName email role profilePic",
        populate: { path: "profilePic", select: "path url" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Reminder.countDocuments(matchQuery),
  ]);

  const populatedReminders = await Promise.all(
    reminders.map(async (rem: any) => {
      let recipientDetails: any = null;

      if (rem.notifyType === "candidate") {
        const lead = await Lead.findById(rem.notifyTo)
          .select("fullName inqNo contact status")
          .lean();
        if (lead) {
          recipientDetails = {
            id: lead._id,
            name: lead.fullName || "—",
            inqNo: lead.inqNo || "—",
            type: "candidate",
          };
        }
      } else if (rem.notifyType === "tac") {
        const user = await User.findById(rem.notifyTo)
          .select("firstName lastName email role profilePic")
          .populate({ path: "profilePic", select: "path url" })
          .lean();
        if (user) {
          const pic = user.profilePic as any;
          recipientDetails = {
            id: user._id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "TAC User",
            email: user.email,
            profilePic: typeof pic === "string" ? pic : pic?.path || pic?.url || null,
            type: "tac",
          };
        }
      }

      return {
        ...rem,
        notifyToDetails: recipientDetails,
      };
    })
  );

  return {
    reminders: populatedReminders,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

// ── 4. Get Single Reminder By ID Service ────────────────────────────────────
export const getReminderByIdService = async (reminderId: string) => {
  const { error } = reminderIdParamSchema.validate({ id: reminderId });
  if (error) {
    throw new ApiError(error.details[0].message, 400);
  }

  const reminder = await Reminder.findById(reminderId)
    .populate({
      path: "sentFrom",
      model: User,
      select: "firstName lastName email role profilePic",
      populate: { path: "profilePic", select: "path url" },
    })
    .lean();

  if (!reminder) {
    throw new ApiError("Reminder not found", 404);
  }

  let recipientDetails: any = null;
  if (reminder.notifyType === "candidate") {
    const lead = await Lead.findById(reminder.notifyTo)
      .select("fullName inqNo contact status")
      .lean();
    if (lead) {
      recipientDetails = {
        id: lead._id,
        name: lead.fullName || "—",
        inqNo: lead.inqNo || "—",
        type: "candidate",
      };
    }
  } else {
    const user = await User.findById(reminder.notifyTo)
      .select("firstName lastName email role profilePic")
      .populate({ path: "profilePic", select: "path url" })
      .lean();
    if (user) {
      const pic = user.profilePic as any;
      recipientDetails = {
        id: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "TAC User",
        email: user.email,
        profilePic: typeof pic === "string" ? pic : pic?.path || pic?.url || null,
        type: "tac",
      };
    }
  }

  return {
    ...reminder,
    notifyToDetails: recipientDetails,
  };
};

// ── 5. Delete Reminder Service ─────────────────────────────────────────────
export const deleteReminderService = async (reminderId: string) => {
  const { error } = reminderIdParamSchema.validate({ id: reminderId });
  if (error) {
    throw new ApiError(error.details[0].message, 400);
  }

  const deleted = await Reminder.findByIdAndDelete(reminderId);
  if (!deleted) {
    throw new ApiError("Reminder not found or already deleted", 404);
  }

  return { message: "Reminder deleted successfully" };
};
