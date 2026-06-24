import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import mongoose from "mongoose";

export const getAwaitingApprovalDocumentsService = async (
  page = 1, 
  limit = 10, 
  filterUserId?: string | null,
  search?: string
) => {
  const skip = (page - 1) * limit;

  // 1. Base query: Documents must be awaiting approval
  const matchQuery: any = {
    "documents.status": "awaiting_approval",
  };

  // 2. Apply TAC Head Branch Filtering (Same as your escalation logic)
  if (filterUserId) {
    const shiftInfos = await EmployeeBranchShiftModel.find({ 
      employeeId: new mongoose.Types.ObjectId(filterUserId) 
    }).lean();
    
    if (!shiftInfos || shiftInfos.length === 0) {
      throw new ApiError("No branch assigned to your account. Please contact Admin.", 403);
    }

    const assignedBranchIds = [...new Set(
      shiftInfos.map(shift => shift.branchId?.toString()).filter(Boolean)
    )];

    if (assignedBranchIds.length === 0) {
      throw new ApiError("Your branch assignment data is invalid or corrupted. Please contact Admin.", 403);
    }

    const branchObjectIds = assignedBranchIds.map(id => new mongoose.Types.ObjectId(id));
    
    // Sirf in assigned branches ke leads dikhao
    matchQuery["preferences.branchId"] = { $in: branchObjectIds };
  }

  // 3. Optional Search Logic (Agar search karna ho frontend se)
  if (search && search.trim().length > 0) {
    const regex = new RegExp(search.trim(), "i");
    matchQuery.$or = [
      { fullName: regex },
      { "contact.email": regex },
      { "contact.phone": regex },
      { inqNo: regex },
    ];
  }

  const totalRecords = await Lead.countDocuments(matchQuery);

  const leads = await Lead.find(matchQuery)
    .populate({
      path: "preferences.consultantId",
      select: "firstName lastName email role",
    })
    .populate({
      path: "documents.position",
      select: "title", // Agar position title chahiye UI par
    })
    .sort({ "documents.submittedOn": -1, createdAt: -1 }) // Latest first
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    leads,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};