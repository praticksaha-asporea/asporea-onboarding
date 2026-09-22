import { FilterUserListQuery } from "@/Types/Backend_Payload/user.types";
import UserModel from "../../models/User.model";
import { SocialLogins } from "../../models/SocialLogins.model";
import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import { ExternalSourceModel } from "../../models/ExternalSource.model";
import { ApiError } from "../../error/api.error";
import { hashPassword } from "../../utils/bcryptUtil";
import mongoose from "mongoose";
import "../../models/Shift.model";
import "../../models/Branch.model";
import "../../models/User.model";
import { Lead } from "../../models/Lead.model";
import { Upload } from "../../models/Upload.model";
import fs from "fs";
import path from "path";
import { handleProfilePicUpload } from "../../utils/uploadUtil";
import { createLeadLogService } from "@/lib/services/leadActivity/leadLog.service";

// ─── Valid roles constant ─────────────────────────────────────────────────────

export const VALID_ROLES = [
  "admin",
  "tac",
  "user",
  "foe",
  "finance",
  "coordinator",
  "pca",
  "pcra",
  "institute",
  "sub_pca",
  "branch_head",
  "tac_head",
] as const;

export type UserRole = (typeof VALID_ROLES)[number];

// ─── List ─────────────────────────────────────────────────────────────────────

export const userList = async ({
  role,
  keyword,
  status,
  page = 1,
  limit = 10,
  excludeId,
}: FilterUserListQuery & {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  excludeId?: string;
}) => {
  const filter: Record<string, unknown> =
    role && VALID_ROLES.includes(role as UserRole)
      ? { role }
      : { role: { $in: VALID_ROLES } };

  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  if (status && ["active", "inactive", "deleted"].includes(status)) {
    filter.status = status;
  }

  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), "i");
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phoneNumber: regex },
      { whatsappNumber: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("-password")
      .populate("profilePic", "path")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createUser = async (body: any, createdBy: string) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    whatsappNumber,
    address,
    role,
    passportStatus,
    passportNo,
    notificationPreference,
    candidateProfile,
    tacProfile,
  } = body;

  const existing = await UserModel.findOne({ email });
  if (existing) throw new ApiError("Email already exists", 401);

  if (phoneNumber) {
    const phoneExists = await UserModel.findOne({ phoneNumber });
    if (phoneExists) throw new ApiError("Phone number already exists", 401);
  }

  if (whatsappNumber) {
    const whatsappExists = await UserModel.findOne({ whatsappNumber });
    if (whatsappExists)
      throw new ApiError("WhatsApp number already exists", 401);
  }

  const hashedPassword = password ? await hashPassword(password) : undefined;

  const user = await UserModel.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
    whatsappNumber,
    address,
    role,
    passportStatus,
    passportNo,
    notificationPreference,
    candidateProfile: role === "user" ? candidateProfile : undefined,
    tacProfile: ["tac", "tac_head"].includes(role) ? tacProfile : undefined,
    status: "active",
    createdBy: new mongoose.Types.ObjectId(createdBy),
  });

  return user;
};

// ─── View (single user with linked data) ─────────────────────────────────────

export const viewUser = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .select("-password")
    .populate("profilePic", "path")
    .populate("reviewer", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();

  if (!user) throw new ApiError("User not found", 404);

  const socialLogins = await SocialLogins.find({ userId })
    .select("type providerId scopes expiresAt createdAt")
    .lean();

  const branchShifts = await EmployeeBranchShiftModel.find({
    employeeId: userId,
  })
    .populate("branchId", "title location timeZone")
    .populate("shiftId", "name startTime endTime")
    .select("-__v")
    .lean();

  const EXTERNAL_ROLES = ["pca", "pcra", "institute"];
  let externalSource = null;
  if (EXTERNAL_ROLES.includes((user as any).role)) {
    externalSource = await ExternalSourceModel.findOne({
      type: (user as any).role,
      status: "active",
    })
      .select("name type status")
      .lean();
  }

  let userDataToReturn = { ...user } as any;
  userDataToReturn.isSocialLogin = socialLogins && socialLogins.length > 0;

  const existingLead = await Lead.findOne({
    "createdBy.id": new mongoose.Types.ObjectId(userId),
  }).lean();

  if (existingLead) {
    userDataToReturn.leadId = existingLead._id?.toString();
    userDataToReturn.prefferedConsultant =
      existingLead.preferences?.consultantId?.toString() || "";
    if (existingLead.preferences?.branchId) {
      userDataToReturn.branch = {
        _id: existingLead.preferences?.branchId?.toString(),
      };
    }

    if (existingLead.preferences?.visitType === "online") {
      userDataToReturn.visitOption = 2;
    } else if (existingLead.preferences?.visitType === "offline") {
      userDataToReturn.visitOption = 1;
    } else {
      userDataToReturn.visitOption = 0;
    }
  }

  return { user: userDataToReturn, socialLogins, branchShifts, externalSource };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateUser = async (userId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  // Prevent email collision
  if (body.email && body.email !== user.email) {
    const collision = await UserModel.findOne({ email: body.email });
    if (collision) throw new ApiError("Email already in use", 401);
  }

  if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
    const phoneExists = await UserModel.findOne({
      phoneNumber: body.phoneNumber,
    });
    if (phoneExists) throw new ApiError("Phone number already exists", 401);
  }

  if (body.whatsappNumber && body.whatsappNumber !== user.whatsappNumber) {
    const whatsappExists = await UserModel.findOne({
      whatsappNumber: body.whatsappNumber,
    });
    if (whatsappExists)
      throw new ApiError("WhatsApp number already exists", 401);
  }

  const ALLOWED = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "whatsappNumber",
    "address",
    "role",
    "passportStatus",
    "passportNo",
    "status",
    "notificationPreference",
    "reviewer",
    "enquired",
    "bio",
    "experienceInMonths",
  ];
  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  if (body.candidateProfile !== undefined) {
    const existingProfile = user.candidateProfile
      ? typeof (user.candidateProfile as any).toObject === "function"
        ? (user.candidateProfile as any).toObject()
        : user.candidateProfile
      : {};

    update["candidateProfile"] = {
      ...existingProfile,
      ...body.candidateProfile,
      // Ensure leadId is NEVER wiped out
      leadId: body.candidateProfile?.leadId || existingProfile?.leadId,
    };
  }

  if (body.tacProfile !== undefined) {
    const existingProfile = user.tacProfile
      ? typeof (user.tacProfile as any).toObject === "function"
        ? (user.tacProfile as any).toObject()
        : user.tacProfile
      : {};

    update["tacProfile"] = {
      ...existingProfile,
      ...body.tacProfile,
      // Ensure leadId is NEVER wiped out
      rating: body.tacProfile?.rating || existingProfile?.rating,
    };
  }

  if (body.password) {
    const hashedPassword = await hashPassword(body.password);
    update["password"] = hashedPassword;
  }

  update.experienceInMonths = update.experienceInMonths
    ? Number(update.experienceInMonths)
    : null;

  if (body.profilePicData) {
    if (body.profilePicData === "REMOVE") {
      update["profilePic"] = null;
    } else {
      const newPicId = await handleProfilePicUpload(
        userId,
        body.profilePicData,
      );
      if (newPicId) update["profilePic"] = newPicId;
    }
  }

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { returnDocument: "after", runValidators: true },
  )
    .select("-password")
    .populate("profilePic", "path");

  // ---------------- ⚡ DETAILED LEAD LOG TRIGGER (EXACT DIFF CHECK) ----------------
  try {
    const linkedLead = await Lead.findOne({
      $or: [
        { _id: user.candidateProfile?.leadId },
        { "createdBy.id": new mongoose.Types.ObjectId(userId) },
      ],
    }).select("_id").lean();

    const targetLeadId = linkedLead?._id || user.candidateProfile?.leadId;

    if (targetLeadId) {
      const rawRole = user.role || "user";
      const roleLabel = rawRole === "user" ? "CANDIDATE" : rawRole.toUpperCase();

      // 🔍 Exact Field Value Comparison (Purani value se compare karenge)
      const changedFields: string[] = [];

      if (
        (body.firstName && body.firstName !== user.firstName) ||
        (body.lastName && body.lastName !== user.lastName)
      ) {
        changedFields.push("Name");
      }

      if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
        changedFields.push("Phone Number");
      }

      if (body.whatsappNumber && body.whatsappNumber !== user.whatsappNumber) {
        changedFields.push("WhatsApp Number");
      }

      if (body.email && body.email !== user.email) {
        changedFields.push("Email");
      }

      if (body.address !== undefined && body.address !== user.address) {
        changedFields.push("Address");
      }

      if (
        (body.passportStatus !== undefined && body.passportStatus !== user.passportStatus) ||
        (body.passportNo !== undefined && body.passportNo !== user.passportNo)
      ) {
        changedFields.push("Passport Details");
      }

      if (body.bio !== undefined && body.bio !== user.bio) {
        changedFields.push("Bio");
      }

      if (body.profilePicData && body.profilePicData !== "REMOVE") {
        changedFields.push("Profile Picture");
      } else if (body.profilePicData === "REMOVE" && user.profilePic) {
        changedFields.push("Profile Picture Removed");
      }

      if (body.candidateProfile) {
        const cp = body.candidateProfile;
        const oldCp = user.candidateProfile || {};
        const isCandidateProfileChanged =
          (cp.academic !== undefined && cp.academic !== oldCp.academic) ||
          (cp.technicalQualification !== undefined && cp.technicalQualification !== oldCp.technicalQualification) ||
          (cp.nationality !== undefined && cp.nationality !== oldCp.nationality) ||
          (cp.workExp !== undefined && cp.workExp !== oldCp.workExp);

        if (isCandidateProfileChanged) {
          changedFields.push("Academic/Technical Details");
        }
      }

      // ⚡ Only log if fields were actually modified
      if (changedFields.length > 0) {
        const actionType = `PROFILE_UPDATED_BY_${roleLabel}`;
        const actionNote = `Profile updated (${changedFields.join(", ")})`;

        await createLeadLogService(
          String(targetLeadId),
          actionType,
          actionNote,
          userId
        );
      }

      // 🔔 Detailed Notification Preferences Tracking
      if (body.notificationPreference !== undefined) {
        const prefs = updated?.notificationPreference || body.notificationPreference || {};
        const enabledChannels: string[] = [];

        if (prefs.email) enabledChannels.push("Email");
        if (prefs.whatsapp) enabledChannels.push("WhatsApp");
        if (prefs.sms) enabledChannels.push("SMS");

        const enabledText = enabledChannels.length > 0 ? enabledChannels.join(", ") : "None";
        const notifActionType = `NOTIFICATION_PREFERENCES_UPDATED_BY_${roleLabel}`;
        const notifActionNote = `Notification preferences updated (Enabled: ${enabledText})`;

        await createLeadLogService(
          String(targetLeadId),
          notifActionType,
          notifActionNote,
          userId
        );
      }
    }
  } catch (logError) {
    console.error("Profile Update LeadLog Error:", logError);
  }

  return updated;
};

// ─── Update note (enquired flag + reviewer) ───────────────────────────────────

export const updateUserNote = async (
  userId: string,
  body: { enquired?: string; reviewer?: string },
) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const update: Record<string, unknown> = {};
  if (body.enquired !== undefined) update.enquired = body.enquired;
  if (body.reviewer) {
    if (!mongoose.Types.ObjectId.isValid(body.reviewer))
      throw new ApiError("Invalid reviewer ID", 400);
    update.reviewer = new mongoose.Types.ObjectId(body.reviewer);
  }

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true },
  ).select("enquired reviewer firstName lastName email");

  return updated;
};

export const getRolesService = async (userRole?: string): Promise<string[]> => {
  if (userRole !== "admin") {
    throw new ApiError("User must be an admin", 403);
  }

  const roles = await UserModel.distinct("role");

  if (!roles || roles.length === 0) {
    throw new ApiError("No roles found in system", 404);
  }

  return roles;
};