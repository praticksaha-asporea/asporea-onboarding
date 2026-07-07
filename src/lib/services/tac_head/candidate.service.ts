import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import mongoose from "mongoose";

export const getAllCandidatesForTacHead = async (
  tacHeadId: string,
  queryFilters: any,
) => {
  const { branchId, tacId, page = 1, limit = 10,search } = queryFilters;

  const assignedBranches = await EmployeeBranchShiftModel.find({
    employeeId: tacHeadId,
  }).lean();

  if (!assignedBranches || assignedBranches.length === 0) {
    return {
      candidates: [],
      total: 0,
      message: "You are not assigned to any branch.",
    };
  }

  const branchIds = assignedBranches.map((b) => b.branchId);

  const matchQuery: any = {
    "preferences.branchId": { $in: branchIds },
  };

  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");  
    
    matchQuery.$or = [
      { fullName: { $regex: searchRegex } },
      { "contact.email": { $regex: searchRegex } },
      { "contact.phone": { $regex: searchRegex } },
      { inqNo: { $regex: searchRegex } }
    ];
  }

  if (branchId) {
    const isAssigned = branchIds.some((id) => id.toString() === branchId);
    if (!isAssigned) {
      throw new ApiError("You don't have access to this branch's data", 403);
    }
    matchQuery["preferences.branchId"] = new mongoose.Types.ObjectId(branchId);
  }

  if (tacId) {
    matchQuery["preferences.consultantId"] = new mongoose.Types.ObjectId(tacId);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [candidates, total] = await Promise.all([
    Lead.find(matchQuery)
      .populate("preferences.branchId", "title")
      .populate("preferences.consultantId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Lead.countDocuments(matchQuery),
  ]);

  return {
    candidates,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
};
