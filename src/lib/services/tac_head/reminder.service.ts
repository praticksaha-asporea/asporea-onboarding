import { ApiError } from "@/lib/error/api.error";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Lead } from "@/lib/models/Lead.model";
import { Assignment } from "@/lib/models/Assignment.model";
import User from "@/lib/models/User.model";
import "@/lib/models/Upload.model";
import { Reminder } from "@/lib/models/Reminder.model";
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

  // ── 2. Match Query (Status + Branch Scope) ──────────────────────────────────
  const matchQuery: any = {
    status: status,
    "preferences.branchId": {
      $in: assignedBranchIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  };

  // ── 3. Fetch Candidates (Leads) ─────────────────────────────────────────────
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

  // Map leadId -> profilePic path/url
  for (const u of candidateUsers as any[]) {
    const lId = u.candidateProfile?.leadId?.toString();
    const pic = u.profilePic;
    if (lId && pic) {
      const picPath =
        typeof pic === "string" ? pic : pic.path || pic.url || null;
      if (picPath) userPicMap.set(lId, picPath);
    }
  }

  // Fallback: Check createdBy.id if user created their own lead
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

  // ── 4. Format Candidates Array for UI ──────────────────────────────────────
  const formattedCandidates = leads.map((lead: any) => ({
    leadId: lead._id,
    inqNo: lead.inqNo || "—",
    fullName: lead.fullName || "—",
    profilePic: userPicMap.get(lead._id.toString()) || null,
  }));

  // ── 5. Fetch TACs from Assignment Table ────────────────────────────────────
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
