import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { DocumentModel } from "@/lib/models/Document.model";
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

   
 const matchQuery: any = {
    status: "doc_awaiting_approval",
  };
   
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
    
     
    matchQuery["preferences.branchId"] = { $in: branchObjectIds };
  }

   
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
      select: "title",  
    })
    .sort({ "documents.submittedOn": -1, createdAt: -1 }) 
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

export const approveRejectDocumentService = async (
  leadId: string,
  status: "verified" | "rejected",
  remarks?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Invalid Lead ID", 400);
  }

   
  await DocumentModel.updateMany(
    { leadId: new mongoose.Types.ObjectId(leadId) },
    { $set: { status: status } }
  );

  
  const leadUpdate: any = {
    status: `doc_${status}`,                     
    "documents.status": status,                 
  };

   
  if (remarks) {
    // leadUpdate["documents.remarks"] = remarks; 
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    leadId,
    { $set: leadUpdate },
    { new: true, runValidators: true }
  );

  if (!updatedLead) {
    throw new ApiError("Lead not found", 404);
  }

  return updatedLead;
};