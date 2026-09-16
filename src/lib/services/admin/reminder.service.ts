import { ApiError } from "@/lib/error/api.error";
import { Lead } from "@/lib/models/Lead.model";
import User, { IUser } from "@/lib/models/User.model";
import { Reminder } from "@/lib/models/Reminder.model";
import "@/lib/models/Upload.model";
import mongoose from "mongoose";
 
 export const getTargetsByRoleService = async (
  role: string
): Promise<any[]> => {
  if (!role) throw new ApiError("Role parameter is required", 400);

  if (role === "user") {
    // 1. Candidate Users with Profile Pic populate
    const users = (await User.find({
      role: "user" as IUser["role"],
      status: "active",
    })
      .select("candidateProfile email profilePic")
      .populate({ path: "profilePic", select: "path url" })
      .lean()) as any[];

    const userPicMap = new Map<string, string>();
    const leadIds: mongoose.Types.ObjectId[] = [];

    for (const u of users) {
      const lId = u.candidateProfile?.leadId?.toString();
      if (lId) {
        leadIds.push(u.candidateProfile.leadId);
        const pic = u.profilePic;
        const picPath =
          typeof pic === "string" ? pic : pic?.path || pic?.url || null;
        if (picPath) userPicMap.set(lId, picPath);
      }
    }

    // 2. Fetch Leads
    const leads = (await Lead.find({ _id: { $in: leadIds } })
      .select("inqNo fullName contact")
      .lean()) as any[];

    return leads.map((lead) => ({
      id: lead._id.toString(),
      name: lead.fullName || "Unknown",
      info: `Inq: ${lead.inqNo || "—"}`,
      type: "candidate" as const,
      profilePic: userPicMap.get(lead._id.toString()) || null,
    }));
  } else {
    
    const users = (await User.find({
      role: role as IUser["role"],
      status: "active",
    })
      .select("firstName lastName email role profilePic")
      .populate({ path: "profilePic", select: "path url" })
      .lean()) as any[];

    return users.map((user) => {
      const pic = user.profilePic;
      const picPath =
        typeof pic === "string" ? pic : pic?.path || pic?.url || null;

      return {
        id: user._id.toString(),
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        info: `${user.email} (${user.role?.toUpperCase() || "STAFF"})`,
        type: "tac" as const,
        profilePic: picPath,
      };
    });
  }
};

// 2. Create Bulk Reminders
export interface ICreateAdminBulkPayload {
  targetIds: string[];
  notifyType: "candidate" | "tac";
  heading: string;
  message: string;
}

export const createAdminBulkRemindersService = async (
  payload: ICreateAdminBulkPayload,
  adminId: string,
) => {
  const { targetIds, notifyType, heading, message } = payload;

  if (!targetIds || targetIds.length === 0) {
    throw new ApiError("Please select at least one recipient", 400);
  }
  if (!heading || !message) {
    throw new ApiError("Heading and message are required", 400);
  }

  const remindersToInsert = targetIds.map((id) => ({
    notifyTo: new mongoose.Types.ObjectId(id),
    notifyType,
    sentFrom: new mongoose.Types.ObjectId(adminId),
    heading: heading.trim(),
    message: message.trim(),
    read: false,
  }));

  const result = await Reminder.insertMany(remindersToInsert);
  return {
    count: result.length,
    message: `${result.length} reminders sent successfully`,
  };
};

// 3. Get Reminders List (All System Data for Admin)
export interface IGetAdminRemindersQuery {
  page?: number;
  limit?: number;
  read?: string;
  notifyType?: string;
  search?: string;
}

export const getAdminRemindersListService = async (
  queryParams: IGetAdminRemindersQuery,
) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const matchQuery: Record<string, any> = {};

  if (queryParams.read && queryParams.read !== "all") {
    matchQuery.read = queryParams.read === "true";
  }

  if (queryParams.notifyType && queryParams.notifyType !== "all") {
    matchQuery.notifyType = queryParams.notifyType;
  }

  if (queryParams.search) {
    matchQuery.$or = [
      { heading: { $regex: queryParams.search, $options: "i" } },
      { message: { $regex: queryParams.search, $options: "i" } },
    ];
  }

  const [reminders, totalCount] = await Promise.all([
    Reminder.find(matchQuery)
      .populate({
        path: "sentFrom",
        model: User,
        select: "firstName lastName email role profilePic",
        populate: { path: "profilePic", select: "path url" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Reminder.countDocuments(matchQuery),
  ]);

  const populatedReminders = await Promise.all(
    reminders.map(async (rem: any) => {
      let recipientDetails: any = null;

      if (rem.notifyType === "candidate") {
        const lead = await Lead.findById(rem.notifyTo)
          .select("fullName inqNo contact status")
          .lean();
        if (lead) {
          const candidateUser: any = await User.findOne({
            "candidateProfile.leadId": lead._id,
          })
            .select("profilePic")
            .populate({ path: "profilePic", select: "path url" })
            .lean();

          const pic = candidateUser?.profilePic;
          const picPath =
            typeof pic === "string" ? pic : pic?.path || pic?.url || null;
          recipientDetails = {
            id: lead._id,
            name: lead.fullName || "—",
            inqNo: lead.inqNo || "—",
            profilePic: picPath,
            type: "candidate",
          };
        }
      } else {
        const user = await User.findById(rem.notifyTo)
          .select("firstName lastName email role profilePic")
          .populate({ path: "profilePic", select: "path url" })
          .lean();
        if (user) {
          const pic = user.profilePic as any;
          const picPath =
            typeof pic === "string" ? pic : pic?.path || pic?.url || null;
          recipientDetails = {
            id: user._id,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
            email: user.email,
            role: user.role,
            profilePic: picPath,
            type: "tac",
          };
        }
      }
      const sentFromPic = rem.sentFrom?.profilePic;
      const sentFromPicPath =
        typeof sentFromPic === "string"
          ? sentFromPic
          : sentFromPic?.path || sentFromPic?.url || null;

      return {
        _id: rem._id.toString(),
        notifyTo: rem.notifyTo.toString(),
        notifyType: rem.notifyType,
        sentFrom: {
          _id: rem.sentFrom._id.toString(),
          firstName: rem.sentFrom.firstName,
          lastName: rem.sentFrom.lastName,
          email: rem.sentFrom.email,
          role: rem.sentFrom.role,
          profilePic: sentFromPicPath,
        },
        heading: rem.heading,
        message: rem.message,
        read: rem.read,
        createdAt: rem.createdAt.toISOString(),
        updatedAt: rem.updatedAt.toISOString(),
        notifyToDetails: recipientDetails,
      };
    }),
  );

  return {
    reminders: populatedReminders,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

// 4. Get Reminder By ID
export const getAdminReminderByIdService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid Reminder ID", 400);
  }

  const reminder = await Reminder.findById(id)
    .populate({
      path: "sentFrom",
      model: User,
      select: "firstName lastName email role profilePic",
      populate: { path: "profilePic", select: "path url" },
    })
    .lean();

  if (!reminder) {
    throw new ApiError("Reminder not found", 404);
  }

  let recipientDetails: any = null;
  if (reminder.notifyType === "candidate") {
    const lead = await Lead.findById(reminder.notifyTo)
      .select("fullName inqNo")
      .lean();
    if (lead) {
      recipientDetails = {
        id: lead._id,
        name: lead.fullName || "—",
        inqNo: lead.inqNo || "—",
        type: "candidate",
      };
    }
  } else {
    const user = await User.findById(reminder.notifyTo)
      .select("firstName lastName email role")
      .lean();
    if (user) {
      recipientDetails = {
        id: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        role: user.role,
        type: "tac",
      };
    }
  }

  return { ...reminder, notifyToDetails: recipientDetails };
};

// 5. Delete Reminder
export const deleteAdminReminderService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid Reminder ID", 400);
  }

  const deleted = await Reminder.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError("Reminder not found or already deleted", 404);
  }

  return { message: "Reminder deleted successfully" };
};
