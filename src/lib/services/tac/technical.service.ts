import { ApiError } from "@/lib/error/api.error";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { Lead } from "@/lib/models/Lead.model";
import mongoose from "mongoose";

export const getTechnicalListService = async (page = 1, limit = 10, filterUserId?: string | null) => {
    const skip = (page - 1) * limit;
    let matchQuery: any = {};
    if (filterUserId) {

        const shiftInfos = await EmployeeBranchShiftModel.find({ employeeId: new mongoose.Types.ObjectId(filterUserId) }).lean();

        const assignedBranchIds = [...new Set(
            shiftInfos.map(shift => shift.branchId?.toString()).filter(Boolean)
        )];

        if (assignedBranchIds.length === 0) {
            throw new ApiError("Your branch assignment data is invalid or corrupted. Please contact Admin.", 403);
        }

        const branchObjectIds = assignedBranchIds.map(id => new mongoose.Types.ObjectId(id));
        const branchLeads = await Lead.find({
            "preferences.branchId": { $in: branchObjectIds }
        }).select("_id").lean();

        const branchLeadIds = branchLeads.map((lead) => lead._id);

        matchQuery = { leadId: { $in: branchLeadIds } };
    }

    const totalRecords = await Lead.countDocuments(matchQuery);

    const technicalRequestedLeads = await Lead.find({ 'experience.status': 'request_technical' })
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