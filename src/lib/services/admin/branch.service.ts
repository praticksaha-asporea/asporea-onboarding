import { BranchModel } from "../../models/Branch.model"; 
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";

export const branchList = async ({
  keyword,
  page = 1,
  limit = 10,
}: {
  keyword?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: Record<string, unknown> = {};

  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), "i");
    filter.$or = [{ title: regex }, { location: regex }];
  }

  const skip = (page - 1) * limit;

  const [branches, total] = await Promise.all([
    BranchModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BranchModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: branches,
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

export const createBranch = async (body: any) => {
  const { title, location, counters, timeZone, workDays,latitude,longitude } = body;

  const existing = await BranchModel.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") },
  });
  if (existing)
    throw new ApiError("Branch with this title already exists", 409);
  // console.log(body,8777);
  
  const branch = await BranchModel.create({
    title,
    location,
    counters,
    timeZone,
    workDays,
    latitude,
    longitude
  });
  // console.log(branch,222222);

  return branch;
};

export const viewBranch = async (branchId: string) => {
  if (!mongoose.Types.ObjectId.isValid(branchId))
    throw new ApiError("Invalid branch ID", 400);

  const branch = await BranchModel.findById(branchId).lean();
  if (!branch) throw new ApiError("Branch not found", 404);

  return branch;
};

export const updateBranch = async (branchId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(branchId))
    throw new ApiError("Invalid branch ID", 400);

  const branch = await BranchModel.findById(branchId);
  if (!branch) throw new ApiError("Branch not found", 404);

  const ALLOWED = ["title", "location", "counters", "timeZone", "workDays", "latitude", "longitude"];
  const update: Record<string, unknown> = {};

  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  const updated = await BranchModel.findByIdAndUpdate(
    branchId,
    { $set: update },
    { new: true, runValidators: true },
  );

  return updated;
};
