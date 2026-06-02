import { ShiftModel } from "../../models/Shift.model";
import { ShiftScheduleModel } from "../../models/ShiftSchedule.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";

export const shiftList = async ({
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
    filter.shiftName = new RegExp(keyword.trim(), "i");
  }

  const skip = (page - 1) * limit;

  const [shifts, total] = await Promise.all([
    ShiftModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ShiftModel.countDocuments(filter),
  ]);
 
  const shiftIds = shifts.map((s) => s._id);
  const allSchedules = await ShiftScheduleModel.find({
    shiftId: { $in: shiftIds },
  }).lean();

  const data = shifts.map((shift) => {
    return {
      ...shift,
      schedules: allSchedules.filter(
        (sch) => String(sch.shiftId) === String(shift._id),
      ),
    };
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
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

export const createShift = async (body: any) => {
  const { shiftName, schedules } = body;

  const existing = await ShiftModel.findOne({
    shiftName: { $regex: new RegExp(`^${shiftName}$`, "i") },
  });
  if (existing) throw new ApiError("Shift with this name already exists", 409);

  const shift = await ShiftModel.create({ shiftName });

  const scheduleDocs = schedules.map((sch: any) => ({
    shiftId: shift._id,
    days: sch.days,
    startTime: sch.startTime,
    endTime: sch.endTime,
    breakTime: sch.breakTime,
  }));

  await ShiftScheduleModel.insertMany(scheduleDocs);

  return { ...shift.toObject(), schedules: scheduleDocs };
};

export const viewShift = async (shiftId: string) => {
  if (!mongoose.Types.ObjectId.isValid(shiftId))
    throw new ApiError("Invalid shift ID", 400);

  const shift = await ShiftModel.findById(shiftId).lean();
  if (!shift) throw new ApiError("Shift not found", 404);

  const schedules = await ShiftScheduleModel.find({ shiftId }).lean();

  return { ...shift, schedules };
};

export const updateShift = async (shiftId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(shiftId))
    throw new ApiError("Invalid shift ID", 400);

  const shift = await ShiftModel.findById(shiftId);
  if (!shift) throw new ApiError("Shift not found", 404);

  if (body.shiftName) {
    shift.shiftName = body.shiftName;
    await shift.save();
  }

  if (body.schedules && body.schedules.length > 0) {
    
    await ShiftScheduleModel.deleteMany({ shiftId });

    const scheduleDocs = body.schedules.map((sch: any) => ({
      shiftId: shift._id,
      days: sch.days,
      startTime: sch.startTime,
      endTime: sch.endTime,
      breakTime: sch.breakTime,
    }));
    await ShiftScheduleModel.insertMany(scheduleDocs);
  }

  const updatedSchedules = await ShiftScheduleModel.find({ shiftId }).lean();
  return { ...shift.toObject(), schedules: updatedSchedules };
};

export const deleteShift = async (shiftId: string) => {
  if (!mongoose.Types.ObjectId.isValid(shiftId))
    throw new ApiError("Invalid shift ID", 400);

  const deleted =
    await ShiftModel.findByIdAndDelete(shiftId);
  if (!deleted) throw new ApiError("Shift not found", 404);

  return { message: "Shift deleted successfully" };
};
