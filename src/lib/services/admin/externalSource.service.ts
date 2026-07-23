import { ApiError } from "@/lib/error/api.error";
import { ExternalSourceModel } from "@/lib/models/ExternalSource.model";
import User from "@/lib/models/User.model";
import { hashPassword } from '../../utils/bcryptUtil';
import mongoose from "mongoose";
export const createExternalSource = async (body: any) => {
  const { 
    firstName, lastName, email, phoneNumber, whatsappNumber, address, 
    password, role, notificationPreference, subOf 
  } = body;
  

  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }, { whatsappNumber: whatsappNumber || "none" }]
  });

  if (existingUser) {
    if (existingUser.email === email) throw new ApiError("This Email is already registered", 409);
    if (existingUser.phoneNumber === phoneNumber) throw new ApiError("This Phone Number is already registered", 409);
    if (existingUser.whatsappNumber === whatsappNumber) throw new ApiError("This WhatsApp Number is already registered", 409);
    throw new ApiError("User already exists with these details", 409);
  }
   
  const hashedPassword = await hashPassword(password);
  const actualRole = role;
  

  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
     
    const [newUser] = await User.create([{
      firstName,
      lastName,
      email,
      phoneNumber,
      whatsappNumber,
      address,
      password: hashedPassword,
      role: actualRole,
      notificationPreference,
      status: "active"
    }], { session });

     
    const sourceName = `${firstName} ${lastName}`.trim();
    const [newSource] = await ExternalSourceModel.create([{
      name: sourceName,
      type: role,  
      userId: newUser._id,
      subOf: subOf || null,
      status: "active"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return newSource;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError("Failed to create external source and user", 500);
  }
};
export const externalSourceList = async ({
  search,
  keyword,
  status,
  type,
  page = 1,
  limit = 10,
}: {
  search?: string;
  keyword?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: Record<string, unknown> = {};

  
  if (type && type !== "all") {
    filter.type = type;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  
  const searchStr = (search || keyword)?.trim();
  if (searchStr && searchStr.length > 0) {
    const regex = new RegExp(searchStr, "i");

     
    const matchingParents = await ExternalSourceModel.find({ name: regex }, "_id").lean();
    const matchingParentIds = matchingParents.map((p) => p._id);

    
    filter.$or = [
      { name: regex },
      { subOf: { $in: matchingParentIds } },
    ];
  }

  const skip = (page - 1) * limit;

 
  const [sources, total] = await Promise.all([
    ExternalSourceModel.find(filter)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("subOf", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ExternalSourceModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: sources,
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
export const updateExternalSource = async (id: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError("Invalid Source ID", 400);

  const source = await ExternalSourceModel.findById(id);
  if (!source) throw new ApiError("Source not found", 404);

  const user = await User.findById(source.userId);
  if (!user) throw new ApiError("Associated user not found", 404);

  const { firstName, lastName, email, phoneNumber, whatsappNumber, address, password, role, notificationPreference, subOf, status } = body;
  
  const targetStatus = status || source.status;
  const targetSubOf = subOf !== undefined ? subOf : source.subOf;

  if (targetStatus === "active" && targetSubOf) {
    const parentSource = await ExternalSourceModel.findById(targetSubOf);
    if (parentSource && parentSource.status === "inactive") {
      throw new ApiError("Parent account is inactive.Please activate the parent before the sub-account", 400);
    }
  }
   
  const duplicateChecks: any[] = [];
  if (email && email.trim() !== user.email) duplicateChecks.push({ email: email.trim() });
  if (phoneNumber && phoneNumber.trim() !== user.phoneNumber) duplicateChecks.push({ phoneNumber: phoneNumber.trim() });
  if (whatsappNumber && whatsappNumber.trim() !== user.whatsappNumber && whatsappNumber !== "none") {
    duplicateChecks.push({ whatsappNumber: whatsappNumber.trim() });
  }

  if (duplicateChecks.length > 0) {
    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      $or: duplicateChecks,
    });

    if (existingUser) {
      if (email && existingUser.email === email) throw new ApiError("Email already registered to another user", 409);
      if (phoneNumber && existingUser.phoneNumber === phoneNumber) throw new ApiError("Phone number already registered to another user", 409);
      if (whatsappNumber && existingUser.whatsappNumber === whatsappNumber) throw new ApiError("WhatsApp number already registered to another user", 409);
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
   
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (whatsappNumber) user.whatsappNumber = whatsappNumber;
    if (address !== undefined) user.address = address;
    if (role) user.role = role;
    if (notificationPreference) user.notificationPreference = notificationPreference;
    if (status) user.status = status;

    if (password && password.trim().length > 0) {
      user.password = await hashPassword(password);
    }
    await user.save({ session });

   
    source.name = `${user.firstName} ${user.lastName}`.trim();
    if (role) source.type = role;
    if (subOf !== undefined) source.subOf = subOf || null;
    if (status) source.status = status;

    await source.save({ session });

    
    if (status === "inactive") {
      const subSources = await ExternalSourceModel.find({ subOf: source._id }, "_id userId").session(session);
      const subSourceIds = subSources.map((s) => s._id);
      const subUserIds = subSources.map((s) => s.userId).filter(Boolean);

      if (subSourceIds.length > 0) {
        await ExternalSourceModel.updateMany({ _id: { $in: subSourceIds } }, { $set: { status: "inactive" } }, { session });
        await User.updateMany({ _id: { $in: subUserIds } }, { $set: { status: "inactive" } }, { session });
      }
    }
    
   

    await session.commitTransaction();
    session.endSession();

    return source;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError("Failed to update source", 500);
  }
};

 
export const toggleSourceStatus = async (id: string, targetStatus?: "active" | "inactive") => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError("Invalid Source ID", 400);

  const source = await ExternalSourceModel.findById(id);
  if (!source) throw new ApiError("Source not found", 404);

   
  const newStatus = targetStatus || (source.status === "active" ? "inactive" : "active");
  if (newStatus === "active" && source.subOf) {
    const parentSource = await ExternalSourceModel.findById(source.subOf);
    if (parentSource && parentSource.status === "inactive") {
      throw new ApiError("Parent account is inactive.Please activate the parent before the sub-account", 400);
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    await ExternalSourceModel.findByIdAndUpdate(id, { $set: { status: newStatus } }, { session });
    if (source.userId) {
      await User.findByIdAndUpdate(source.userId, { $set: { status: newStatus } }, { session });
    }

    
    if (newStatus === "inactive") {
      const subSources = await ExternalSourceModel.find({ subOf: id }, "_id userId").session(session);
      const subSourceIds = subSources.map((s) => s._id);
      const subUserIds = subSources.map((s) => s.userId).filter(Boolean);

      if (subSourceIds.length > 0) {
        await ExternalSourceModel.updateMany({ _id: { $in: subSourceIds } }, { $set: { status: "inactive" } }, { session });
        await User.updateMany({ _id: { $in: subUserIds } }, { $set: { status: "inactive" } }, { session });
      }
    }
     

    await session.commitTransaction();
    session.endSession();

    return { 
      message: `Source successfully set to ${newStatus}${newStatus === "inactive" ? " along with sub-accounts" : ""}` 
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError("Failed to update status", 500);
  }
};
export const getExternalSourceById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError("Invalid Source ID", 400);
  const source = await ExternalSourceModel.findById(id)
    .populate("userId")
    .populate("subOf", "status name");  
  if (!source) throw new ApiError("Source not found", 404);
  return source;
};