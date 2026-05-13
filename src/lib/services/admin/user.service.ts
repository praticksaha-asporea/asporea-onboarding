import { FilterUserListQuery } from '@/Types/Backend_Payload/user.types';
import UserModel from '../../models/User.model';
import { SocialLogins } from '../../models/SocialLogins.model';
import { EmployeeBranchShiftModel } from '../../models/EmployeeBranchShift.model';
import { ExternalSourceModel } from '../../models/ExternalSource.model';
import { ApiError } from '../../error/api.error';
import { hashPassword } from '../../utils/bcryptUtil';
import mongoose from 'mongoose';

import '../../models/Shift.model'
import '../../models/Branch.model'
import '../../models/User.model'

// ─── Valid roles constant ─────────────────────────────────────────────────────

export const VALID_ROLES = [
  'admin', 'tac', 'user', 'reception', 'finance', 'coordinator',
  'pca', 'pcra', 'institute', 'sub_pca', 'branch_head', 'tac_head',
] as const;

export type UserRole = typeof VALID_ROLES[number];

// ─── List ─────────────────────────────────────────────────────────────────────

export const userList = async ({
  role,
  keyword,
  page = 1,
  limit = 10,
}: FilterUserListQuery & {
  page?: number;
  limit?: number;
  keyword?: string;
}) => {
  const filter: Record<string, unknown> =
    role && VALID_ROLES.includes(role as UserRole)
      ? { role }
      : { role: { $in: VALID_ROLES } };

  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select('-password')
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
    firstName, lastName, email, password, phoneNumber, whatsappNumber,
    address, role, passportStatus, passportNo, notificationPreference,
  } = body;

  const existing = await UserModel.findOne({ email });
  if (existing) throw new ApiError('Email already exists', 401);

  if (phoneNumber) {
    const phoneExists = await UserModel.findOne({ phoneNumber });
    if (phoneExists) throw new ApiError('Phone number already exists', 401);
  }

  if (whatsappNumber) {
    const whatsappExists = await UserModel.findOne({ whatsappNumber });
    if (whatsappExists) throw new ApiError('WhatsApp number already exists', 401);
  }

  const hashedPassword = password ? await hashPassword(password) : undefined;

  const user = await UserModel.create({
    firstName, lastName, email,
    password: hashedPassword,
    phoneNumber, whatsappNumber, address, role,
    passportStatus, passportNo, notificationPreference,
    status: 'active',
    createdBy: new mongoose.Types.ObjectId(createdBy),
  });

  return user;
};

// ─── View (single user with linked data) ─────────────────────────────────────

export const viewUser = async (userId: string) => {
  // if (!mongoose.Types.ObjectId.isValid(userId))
  //   throw new ApiError('Invalid user ID', 400);

  const user = await UserModel.findById(userId)
    .select('-password')
    .populate('profilePic', 'url')
    .populate('reviewer', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .lean();

  if (!user) throw new ApiError('User not found', 404);

  // Linked social logins
  const socialLogins = await SocialLogins.find({ userId })
    .select('type providerId scopes expiresAt createdAt')
    .lean();

  // Branch + shift assignments
  const branchShifts = await EmployeeBranchShiftModel.find({ employeeId: userId })
    .populate('branchId', 'title location timeZone')
    .populate('shiftId', 'name startTime endTime')
    .select('-__v')
    .lean();

  // External source link (only relevant for pca / pcra / institute roles)
  const EXTERNAL_ROLES = ['pca', 'pcra', 'institute'];
  let externalSource = null;
  if (EXTERNAL_ROLES.includes((user as any).role)) {
    externalSource = await ExternalSourceModel.findOne({
      type: (user as any).role,
      status: 'active',
    })
      .select('name type status')
      .lean();
  }

  return { user, socialLogins, branchShifts, externalSource };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateUser = async (userId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError('Invalid user ID', 400);

  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError('User not found', 404);

  // Prevent email collision
  if (body.email && body.email !== user.email) {
    const collision = await UserModel.findOne({ email: body.email });
    if (collision) throw new ApiError('Email already in use', 401);
  }

  if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
    const phoneExists = await UserModel.findOne({ phoneNumber: body.phoneNumber });
    if (phoneExists) throw new ApiError('Phone number already exists', 401);
  }

  if (body.whatsappNumber && body.whatsappNumber !== user.whatsappNumber) {
    const whatsappExists = await UserModel.findOne({ whatsappNumber: body.whatsappNumber });
    if (whatsappExists) throw new ApiError('WhatsApp number already exists', 401);
  }

  // Never allow password update through this endpoint
  delete body.password;

  const ALLOWED = [
    'firstName', 'lastName', 'email', 'phoneNumber', 'whatsappNumber',
    'address', 'role', 'passportStatus', 'passportNo', 'status',
    'notificationPreference', 'reviewer', 'enquired'
  ];

  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  return updated;
};

// ─── Update note (enquired flag + reviewer) ───────────────────────────────────

export const updateUserNote = async (
  userId: string,
  body: { enquired?: string; reviewer?: string },
) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError('Invalid user ID', 400);

  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError('User not found', 404);

  const update: Record<string, unknown> = {};
  if (body.enquired !== undefined) update.enquired = body.enquired;
  if (body.reviewer) {
    if (!mongoose.Types.ObjectId.isValid(body.reviewer))
      throw new ApiError('Invalid reviewer ID', 400);
    update.reviewer = new mongoose.Types.ObjectId(body.reviewer);
  }

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true },
  ).select('enquired reviewer firstName lastName email');

  return updated;
};

