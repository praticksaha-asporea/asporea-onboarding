import { BranchModel } from "../../models/Branch.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";

export const branchList = async ({
  keyword,
  timeZone,
  latitude,
  longitude,
  radiusKm,
  page = 1,
  limit = 10,
}: {
  keyword?: string;
  timeZone?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;
  const match: Record<string, unknown> = {};

  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), "i");
    match.$or = [{ title: regex }, { location: regex }];
  }

  if (timeZone && timeZone.trim().length > 0) {
    match.timeZone = timeZone.trim();
  }

  // ── Geo search ────────────────────────────────────────────────────────────
  if (latitude !== undefined && longitude !== undefined) {
    const radius = (radiusKm ?? 50) * 1000; // default 50 km, convert to metres

    const geoResults = await BranchModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",   // metres
          maxDistance: radius,
          spherical: true,
          query: match,
        },
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          location: 1,
          timeZone: 1,
          distanceKm: 1,
        },
      },
    ]);

    const total = await BranchModel.countDocuments({
      ...match,
      coordinates: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378100],
        },
      },
    });

    return {
      data: geoResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // ── Regular list ──────────────────────────────────────────────────────────
  const [branches, total] = await Promise.all([
    BranchModel.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BranchModel.countDocuments(match),
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
  const { title, location, counters, timeZone, workDays, latitude, longitude } = body;

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
    coordinates: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
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
  let update: Record<string, unknown> = {};

  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  
    update['coordinates'] = {
      type: "Point",
      coordinates: [body.longitude , body.latitude],
    };

  const updated = await BranchModel.findByIdAndUpdate(
    branchId,
    { $set: update },
    { new: true, runValidators: true },
  );

  return updated;
};
