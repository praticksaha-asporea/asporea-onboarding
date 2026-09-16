import mongoose from "mongoose";
import { Assignment } from "@/lib/models/Assignment.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import User from "@/lib/models/User.model";
import "@/lib/models/Upload.model";
import { ApiError } from "@/lib/error/api.error";

export const getFoeScheduleService = async (
  foeId: string,
  month: number,
  year: number,
) => {
  if (!foeId || !mongoose.Types.ObjectId.isValid(foeId)) {
    throw new ApiError("Invalid FOE ID", 400);
  }

  const foeShifts = await EmployeeBranchShiftModel.find({
    employeeId: new mongoose.Types.ObjectId(foeId),
  }).lean();
  const branchIds = foeShifts.map((s: any) => s.branchId);

  if (branchIds.length === 0) return [];

  const shiftsInBranches = await EmployeeBranchShiftModel.find({
    branchId: { $in: branchIds },
  }).lean();
  const rawEmployeeIds = shiftsInBranches.map((s: any) => s.employeeId);

  const tacUsers = await User.find({
    _id: { $in: rawEmployeeIds },
    role: "tac",
    status: "active",
  })
    .select("_id")
    .lean();

  const tacIds = tacUsers.map((u: any) => u._id);
  if (tacIds.length === 0) return [];

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const assignments = await Assignment.find({
    assignedTo: { $in: tacIds },
    "schedule.date": { $gte: startDate, $lte: endDate },
  })
    .populate("leadId", "fullName inqNo contact")
    .populate({
      path: "assignedTo",
      select: "firstName lastName role profilePic",
      populate: { path: "profilePic", select: "path url" },
    })
    .sort({ "schedule.date": 1 })
    .lean();
  if (!assignments || assignments.length === 0) {
    return [];
  }

  const leadIds = assignments.map((a: any) => a.leadId?._id).filter(Boolean);
  const emails = assignments
    .map((a: any) => a.leadId?.contact?.email)
    .filter(Boolean);
  const phones = assignments
    .map((a: any) => a.leadId?.contact?.phone || a.leadId?.contact?.whatsapp)
    .filter(Boolean);

  const candidateUsers = await User.find({
    $or: [
      { "candidateProfile.leadId": { $in: leadIds } },
      { email: { $in: emails } },
      { phoneNumber: { $in: phones } },
      { whatsappNumber: { $in: phones } },
    ],
  })
    .select("email phoneNumber whatsappNumber candidateProfile profilePic")
    .populate("profilePic", "path url")
    .lean();

  const profilePicMap = new Map<string, string>();
  candidateUsers.forEach((u: any) => {
    const picObj = u.profilePic;
    const picPath = picObj?.path || picObj?.url || "";

    if (!picPath) return;

    if (u.candidateProfile?.leadId) {
      profilePicMap.set(u.candidateProfile.leadId.toString(), picPath);
    }
    if (u.email) {
      profilePicMap.set(u.email.toLowerCase(), picPath);
    }
    if (u.phoneNumber) {
      profilePicMap.set(u.phoneNumber, picPath);
    }
    if (u.whatsappNumber) {
      profilePicMap.set(u.whatsappNumber, picPath);
    }
  });

  return assignments.map((item: any) => {
    const lead = item.leadId;
    let profilePic = "";

    if (lead) {
      const lId = lead._id?.toString();
      const email = lead.contact?.email?.toLowerCase();
      const phone = lead.contact?.phone || lead.contact?.whatsapp;

      profilePic =
        (lId && profilePicMap.get(lId)) ||
        (email && profilePicMap.get(email)) ||
        (phone && profilePicMap.get(phone)) ||
        "";
    }

    return {
      ...item,
      leadId: lead
        ? {
            ...lead,
            profilePic,
          }
        : null,
    };
  });
};
