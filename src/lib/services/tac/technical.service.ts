import { ApiError } from "@/lib/error/api.error";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Lead } from "@/lib/models/Lead.model";
import mongoose from "mongoose";

export const getTechnicalListService = async (
  page = 1,
  limit = 10,
  filterUserId?: string | null,
  search = "",
  status = "",
) => {
  const skip = (page - 1) * limit;

  // ── Base query ─────────────────────────────────────────────────────────────
  let matchQuery: any = { "technical.required": true };

  // ── Branch-scope filter for tac_head ──────────────────────────────────────
  if (filterUserId) {
    const shiftInfos = await EmployeeBranchShiftModel.find({
      employeeId: new mongoose.Types.ObjectId(filterUserId),
    }).lean();

    const assignedBranchIds = [
      ...new Set(
        shiftInfos.map((s) => s.branchId?.toString()).filter(Boolean),
      ),
    ];

    if (assignedBranchIds.length === 0) {
      throw new ApiError(
        "Your branch assignment data is invalid or corrupted. Please contact Admin.",
        403,
      );
    }

    matchQuery["preferences.branchId"] = {
      $in: assignedBranchIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  // ── Status filter ──────────────────────────────────────────────────────────
  if (status) {
    matchQuery["technical.status"] = status;
  }

  // ── Search filter (name, inqNo, phone, email) ──────────────────────────────
  if (search) {
    const regex = new RegExp(search, "i");
    matchQuery["$or"] = [
      { fullName: regex },
      { inqNo: regex },
      { "contact.phone": regex },
      { "contact.email": regex },
    ];
  }

  const totalRecords = await Lead.countDocuments(matchQuery);

  const technicalRequestedLeads = await Lead.find(matchQuery)
    .populate({
      path: "preferences.consultantId",
      select: "firstName lastName email role",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    technicalRequestedLeads,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};