import mongoose from "mongoose";
import { Lead } from "../../models/Lead.model";
import { BranchTokenModel } from "../../models/BranchToken.model";
import "../../models/User.model";
import "../../models/Branch.model";

export interface CandidateListParams {
  tacId: string;
  search?: string;
  status?: string;
  experience?: string;
  page?: number;
  limit?: number;
}

export const getTacCandidates = async ({
  tacId,
  search,
  status,
  experience,
  page = 1,
  limit = 10,
}: CandidateListParams) => {
  const tacObjectId = new mongoose.Types.ObjectId(tacId);

  // Base filter — leads assigned to this TAC
  const filter: Record<string, unknown> = {
    "preferences.consultantId": tacObjectId,
  };

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
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  // Batch-fetch today's tokens for all lead user IDs
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leadIds = leads
    .map((l) => (l as any)._id)
    .filter(Boolean);

  // BranchToken links userId → Lead's contact user — we match by lead's preferred branch + today
  const tokens = await BranchTokenModel.find({
    generateDate: { $gte: today },
  })
    .select("tokenNo userId branchId status")
    .lean();

  const tokenMap = new Map<string, string>();
  for (const t of tokens) {
    if (t.userId) tokenMap.set(String(t.userId), t.tokenNo);
  }

  const rows = leads.map((lead: any) => ({
    _id: String(lead._id),
    name: lead.fullName ?? "—",
    inqNo: lead.inqNo ?? "—",
    stage: resolveStage(lead),
    status: lead.status ?? "pending",
    experience: lead.experience?.type ?? null,
    token: tokenMap.get(String(lead.createdBy.id)) ?? null,
    lastActivity: lead.updatedAt,
    branchId: lead.preferences?.branchId ?? null,
    visitType: lead.preferences?.visitType ?? null,
    contact: lead.contact,
  }));

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

export const getTacKpis = async (tacId: string) => {
  const tacObjectId = new mongoose.Types.ObjectId(tacId);
  const base = { "preferences.consultantId": tacObjectId };

  const [openCases, pendingCounselling, pendingAssessment] = await Promise.all([
    Lead.countDocuments({ ...base }),
    Lead.countDocuments({ ...base, status: "inquiry_submitted" }),
    Lead.countDocuments({ ...base, status: "assessment_submitted" }),
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
