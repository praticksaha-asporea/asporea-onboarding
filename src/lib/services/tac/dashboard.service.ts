import mongoose from "mongoose";
import { Lead } from "../../models/Lead.model";
import { BranchTokenModel } from "../../models/BranchToken.model";
import "../../models/User.model";
import "../../models/Branch.model";
import "../../models/Upload.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Assignment } from "@/lib/models/Assignment.model";
import { EscalationReportModel } from "@/lib/models/EscalationReport.model";

export interface CandidateListParams {
  userId: string;
  role: string;
  search?: string;
  status?: string;
  experience?: string;
  page?: number;
  limit?: number;
}

export const getTacCandidates = async ({
  userId,
  role,
  search,
  status,
  experience,
  page = 1,
  limit = 10,
}: CandidateListParams) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let filter: Record<string, unknown> = {};

if (role === "admin") {
    
  } else if (role === "foe") {
    const shift = await EmployeeBranchShiftModel.findOne({ employeeId: userObjectId });
    if (shift) {
      filter["preferences.branchId"] = shift.branchId;
    } else {
      filter["preferences.branchId"] = null;
    }
  } else {
    
    filter["preferences.consultantId"] = userObjectId;
  }

  if (status) filter.status = status;
  if (experience) filter["experience.type"] = experience;

  if (search && search.trim().length > 0) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { fullName: regex },
      { inqNo: regex },
      { "contact.email": regex },
      { "contact.phone": regex },
    ];
  }
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("preferences.consultantId", "firstName lastName")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);


  const today = new Date();
  today.setHours(0, 0, 0, 0);



  const tokens = await BranchTokenModel.find({
    generateDate: { $gte: today },
  })
    .select("tokenNo userId branchId status")
    .lean();

  const tokenMap = new Map<string, string>();
  for (const t of tokens) {
    if (t.userId) tokenMap.set(String(t.userId), t.tokenNo);
  }

  const creatorIds = leads.map(l => l.createdBy?.id || l.createdBy?._id || l.createdBy).filter(Boolean);
  const users = await mongoose.model("User").find({ _id: { $in: creatorIds } })
.select("profilePic googlePic avatar")    
.populate("profilePic", "path")
    .lean();
const userPicMap = new Map<string, string>();
for (const u of users) {
  const pic = (u as any).profilePic || (u as any).googlePic || (u as any).avatar;
if (typeof pic === "string") {
    userPicMap.set(String(u._id), pic);
  } else if (pic?.path) {
    userPicMap.set(String(u._id), pic.path);
  }
}
   
  const leadIds = leads.map((l) => l._id);
  const assignments = await Assignment.find({ leadId: { $in: leadIds } })
    .sort({ createdAt: -1 })
    .select("leadId schedule.method createdAt")
    .lean();

  const latestVisitTypeMap = new Map<string, string>();
  for (const ass of assignments) {
    const lId = String(ass.leadId);
    if (!latestVisitTypeMap.has(lId) && ass.schedule?.method) {
      const mappedType =
        ass.schedule.method === "on"
          ? "online"
          : ass.schedule.method === "off"
          ? "offline"
          : ass.schedule.method;
      latestVisitTypeMap.set(lId, mappedType);
    }
  }

  const rows = leads.map((lead: any) => {
    const creatorId = lead.createdBy?.id || lead.createdBy?._id || lead.createdBy;
    let assignedTacName = "Unassigned";
    if (lead.preferences?.consultantId && lead.preferences.consultantId.firstName) {
      assignedTacName = `${lead.preferences.consultantId.firstName} ${lead.preferences.consultantId.lastName || ""}`.trim();
    }

    
    const resolvedVisitType =
      latestVisitTypeMap.get(String(lead._id)) ??
      lead.preferences?.visitType ??
      null;

    return {
      _id: String(lead._id),
      name: lead.fullName ?? "—",
      inqNo: lead.inqNo ?? "—",
      stage: resolveStage(lead),
      status: lead.status ?? "pending",
      experience: lead.experience?.type ?? null,
      token: creatorId ? (tokenMap.get(String(creatorId)) ?? null) : null,
      profilePic: creatorId ? (userPicMap.get(String(creatorId)) ?? null) : null,
      lastActivity: lead.updatedAt,
      branchId: lead.preferences?.branchId ?? null,
      visitType: resolvedVisitType,
      contact: lead.contact,
      consultantId: lead.preferences?.consultantId ?? null,
      assignedTacName
    };
  });

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

// ─── KPI counts for the TAC ───────────────────────────────────────────────────

export const getTacKpis = async (userId: string, role: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let base: any = {};

if (role === "admin") {
   
  } else if (role === "foe") {
    const shift = await EmployeeBranchShiftModel.findOne({ employeeId: userObjectId });
    if (shift) base["preferences.branchId"] = shift.branchId;
  } else {
    base["preferences.consultantId"] = userObjectId;
  }
  // const today = new Date().toISOString().split("T")[0];
  const [openCases, pendingCounselling, pendingAssessment, escalationsRaised, unassignedInquiries] = await Promise.all([
    Lead.countDocuments({ ...base }),
    Lead.countDocuments({ ...base, status: "inquiry_submitted" }),
    Lead.countDocuments({ ...base, status: "assess_scheduled" }),
    // Assignment.countDocuments({ assignedTo: userObjectId, "schedule.date": today }),
    EscalationReportModel.countDocuments({ fromId: userObjectId, status: "requested" }),
    Lead.countDocuments({ ...base, "preferences.consultantId": null, status: { $in: ["assess_scheduled", "pre_scheduled", "inquiry_submitted"] } }),

  ]);

  return { openCases, pendingCounselling, pendingAssessment, escalationsRaised, unassignedInquiries };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStage(lead: any): string {
  if (lead.technical?.status && lead.technical.status !== "na") return "Technical Round";
  if (lead.documents?.status && lead.documents.status !== "na") return "Documents";
  if (lead.experience?.type) return "Experience";
  return "Inquiry";
}
