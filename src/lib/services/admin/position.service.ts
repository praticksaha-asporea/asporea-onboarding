import { ApiError } from "@/lib/error/api.error";
import { Position } from "@/lib/models/Position.model";
import "../../models/DocumentType.model";
import mongoose from "mongoose";

export const createPosition = async (body: any) => {
  const {
    title,
    details,
    requiredDocuments,
    mandatoryDocuments,
    positionBrochure,
  } = body;

  const existing = await Position.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") },
  });
  if (existing)
    throw new ApiError("Position with this title already exists", 409);

  return await Position.create({
    title,
    details,
    requiredDocuments,
    mandatoryDocuments,
    positionBrochure,
  });
};

export const positionList = async ({
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
    filter.title = new RegExp(keyword.trim(), "i");
  }

  const skip = (page - 1) * limit;

  const [positions, total] = await Promise.all([
    Position.find(filter)
      .populate("requiredDocuments", "title section")
      .populate("mandatoryDocuments", "title section")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Position.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: positions,
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

export const viewPosition = async (positionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(positionId))
    throw new ApiError("Invalid position ID", 400);

  const position = await Position.findById(positionId)
    .populate("requiredDocuments", "title section")
    .populate("mandatoryDocuments", "title section")
    .populate("positionBrochure", "url")
    .lean();

  if (!position) throw new ApiError("Position not found", 404);

  return position;
};

export const viewPositionForUser = async (positionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(positionId))
    throw new ApiError("Invalid position ID", 400);

  const position = await Position.findById(positionId)

    .populate(
      "requiredDocuments",
      "title section subTitle supportedExtensions multiple required",
    )
    .populate(
      "mandatoryDocuments",
      "title section subTitle supportedExtensions multiple required",
    )
    .populate("positionBrochure", "url")
    .lean();

  if (!position) throw new ApiError("Position not found", 404);

  return position;
};

export const updatePosition = async (positionId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(positionId))
    throw new ApiError("Invalid position ID", 400);

  const position = await Position.findById(positionId);
  if (!position) throw new ApiError("Position not found", 404);

  if (body.title && body.title !== position.title) {
    const collision = await Position.findOne({
      title: { $regex: new RegExp(`^${body.title}$`, "i") },
      _id: { $ne: positionId },
    });
    if (collision)
      throw new ApiError("Position with this title already exists", 409);
  }

  const ALLOWED = [
    "title",
    "details",
    "requiredDocuments",
    "mandatoryDocuments",
    "positionBrochure",
  ];
  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  return await Position.findByIdAndUpdate(
    positionId,
    { $set: update },
    { new: true, runValidators: true },
  )
    .populate("requiredDocuments", "title section")
    .populate("mandatoryDocuments", "title section");
};

export const deletePosition = async (positionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(positionId))
    throw new ApiError("Invalid position ID", 400);

  const deleted = await Position.findByIdAndDelete(positionId);
  if (!deleted) throw new ApiError("Position not found", 404);

  return { message: "Position deleted successfully" };
};
