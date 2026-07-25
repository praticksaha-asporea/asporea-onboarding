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
import '../../models/User.model';
import { Lead } from '../../models/Lead.model';
import { Upload } from '../../models/Upload.model';
import fs from 'fs';
import path from 'path';


// ─── Valid roles constant ─────────────────────────────────────────────────────

export const VALID_ROLES = [
  'admin', 'tac', 'user', 'foe', 'finance', 'coordinator',
  'pca', 'pcra', 'institute', 'sub_pca', 'branch_head', 'tac_head',
] as const;

export type UserRole = typeof VALID_ROLES[number];

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

  // Exclude the requesting admin from results and count
  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  // Status filter
  if (status && ['active', 'inactive', 'deleted'].includes(status)) {
    filter.status = status;
  }

  // Keyword search across name + email
  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      {phoneNumber:regex},
     { whatsappNumber: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select('-password')
      .populate('profilePic', 'path')  
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
    .populate('profilePic', 'path')
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

  let userDataToReturn = { ...user } as any;
  userDataToReturn.isSocialLogin = socialLogins && socialLogins.length > 0

  const existingLead = await Lead.findOne({
    "createdBy.id": new mongoose.Types.ObjectId(userId)
  }).lean();

  if (existingLead) {
    userDataToReturn.leadId = existingLead._id?.toString();
    userDataToReturn.prefferedConsultant = existingLead.preferences?.consultantId?.toString() || "";
    if (existingLead.preferences?.branchId) {
      userDataToReturn.branch = { _id: existingLead.preferences?.branchId?.toString() };
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


  // delete body.password;

  const ALLOWED = [
    'firstName', 'lastName', 'email', 'phoneNumber', 'whatsappNumber',
    'address', 'role', 'passportStatus', 'passportNo', 'status',
    'notificationPreference', 'reviewer', 'enquired', 'bio', 'experienceInMonths'
  ];

  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  if(body.password)
  {
    
  const hashedPassword = await hashPassword(body.password);
    update['password'] = hashedPassword;
  }
  update.experienceInMonths =
    update.experienceInMonths
      ? Number(update.experienceInMonths)
      : null;

if (body.profilePicData === "REMOVE") {
  update['profilePic'] = null; 
} else if (body.profilePicData && body.profilePicData.startsWith('data:image')) {
  
   
  const matches = body.profilePicData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (matches && matches.length === 3) {
    const imageType = matches[1];  
    const base64Data = matches[2];  
    const buffer = Buffer.from(base64Data, 'base64');
    
    
    const extension = imageType.split('/')[1] || 'jpeg';
    const fileName = `profile_${userId}_${Date.now()}.${extension}`;
    
     
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    
    
    fs.writeFileSync(filePath, buffer);
    
     
    const dbFilePath = `/uploads/profiles/${fileName}`;
    
    const uploadDoc = await Upload.create({
      userId: new mongoose.Types.ObjectId(userId),
      path: dbFilePath  
    });
    
    update['profilePic'] = uploadDoc._id;
  }
}
const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: update },
    { returnDocument: 'after', runValidators: true }  
  )
  .select("-password")
  .populate('profilePic', 'path'); 

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

