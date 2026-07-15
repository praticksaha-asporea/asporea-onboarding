import mongoose from "mongoose";
import { Lead } from "../../models/Lead.model";
import { BranchTokenModel } from "../../models/BranchToken.model";
import "../../models/User.model";
import "../../models/Branch.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";

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

   
  if (role === "foe") {
     
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

  const rows = leads.map((lead: any) => {
   
    const creatorId = lead.createdBy?.id || lead.createdBy?._id || lead.createdBy;
    let assignedTacName = "Unassigned";
    if (lead.preferences?.consultantId && lead.preferences.consultantId.firstName) {
      assignedTacName = `${lead.preferences.consultantId.firstName} ${lead.preferences.consultantId.lastName || ""}`.trim();
    }

    return {
      _id: String(lead._id),
      name: lead.fullName ?? "—",
      inqNo: lead.inqNo ?? "—",
      stage: resolveStage(lead),
      status: lead.status ?? "pending",
      experience: lead.experience?.type ?? null,
      
     
      token: creatorId ? (tokenMap.get(String(creatorId)) ?? null) : null,
      
      lastActivity: lead.updatedAt,
      branchId: lead.preferences?.branchId ?? null,
      visitType: lead.preferences?.visitType ?? null,
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

  if (role === "foe") {
    const shift = await EmployeeBranchShiftModel.findOne({ employeeId: userObjectId });
    if (shift) base["preferences.branchId"] = shift.branchId;
  } else {
    base["preferences.consultantId"] = userObjectId;
  }

  const [openCases, pendingCounselling, pendingAssessment] = await Promise.all([
    Lead.countDocuments({ ...base }),
    Lead.countDocuments({ ...base, status: "inquiry_submitted" }),
    Lead.countDocuments({ ...base, status: "assess_scheduled" }),
  ]);

  return { openCases, pendingCounselling, pendingAssessment };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStage(lead: any): string {
  if (lead.technical?.status && lead.technical.status !== "na") return "Technical Round";
  if (lead.documents?.status && lead.documents.status !== "na") return "Documents";
  if (lead.experience?.type) return "Experience";
  return "Inquiry";
}
