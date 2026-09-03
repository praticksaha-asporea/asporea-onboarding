import mongoose from "mongoose";
import { Assignment } from "@/lib/models/Assignment.model";
import User from "@/lib/models/User.model";
import "@/lib/models/Upload.model";
import { ApiError } from "@/lib/error/api.error";

export const getTacScheduleService = async (
  tacId: string,
  month: number,
  year: number,
) => {
  if (!tacId || !mongoose.Types.ObjectId.isValid(tacId)) {
    throw new ApiError("Invalid TAC ID", 400);
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const assignments = await Assignment.find({
    assignedTo: new mongoose.Types.ObjectId(tacId),
    "schedule.date": { $gte: startDate, $lte: endDate },
  })
    .populate("leadId", "fullName inqNo contact")
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
