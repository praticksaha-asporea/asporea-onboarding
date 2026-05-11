import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";
import '../../models/User.model'
import '../../models/Branch.model'
import '../../models/Shift.model'

export const assignmentList = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    EmployeeBranchShiftModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

      .populate("employeeId", "firstName lastName role")
      .populate("branchId", "title")
      .populate("shiftId", "shiftName")
      .lean(),
    EmployeeBranchShiftModel.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: assignments,
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

export const createAssignment = async (body: any) => {
  try {
    const assignment = await EmployeeBranchShiftModel.create(body);

    const populatedAssignment = await EmployeeBranchShiftModel.findById(
      assignment._id,
    )
      .populate("employeeId", "firstName lastName role")
      .populate("branchId", "title")
      .populate("shiftId", "shiftName")
      .lean();

    return populatedAssignment;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        "This employee is already assigned to this branch and shift.",
        409,
      );
    }
    throw error;
  }
};

export const deleteAssignment = async (assignmentId: string) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw new ApiError("Invalid assignment ID", 400);

  const deleted =
    await EmployeeBranchShiftModel.findByIdAndDelete(assignmentId);
  if (!deleted) throw new ApiError("Assignment not found", 404);

  return { message: "Assignment deleted successfully" };
};
