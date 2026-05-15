import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";
import '../../models/User.model'
import { BranchModel } from "../../models/Branch.model";
import '../../models/Shift.model'

async function enforceCounterLimit(branchId: string, counterNo: number | undefined) {
  if (counterNo === undefined) return;

  const branch = await BranchModel.findById(branchId).select("counters").lean();
  if (!branch) throw new ApiError("Branch not found", 404);

  const limit = (branch as any).counters ?? 0;
  if (limit > 0 && counterNo > limit) {
    throw new ApiError(
      `Counter No (${counterNo}) exceeds the branch's counter limit (${limit}), Please update branch configuration first`,
      400,
    );
  }
}

export const assignmentList = async ({
  page = 1,
  limit = 10,
  search,
  role,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  const skip = (page - 1) * limit;

  const assignmentFilter: Record<string, unknown> = {};

  if (search && search.trim().length > 0) {
    const regex = new RegExp(search.trim(), "i");

    // Resolve employee IDs matching name/email
    const UserModel = mongoose.model("User");
    const empFilter: Record<string, unknown> = {
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    };
    if (role) empFilter.role = role;
    const employees = await UserModel.find(empFilter).select("_id").lean();
    const employeeIds = employees.map((e: any) => e._id);

    // Resolve branch IDs matching title
    const branches = await BranchModel.find({ title: regex }).select("_id").lean();
    const branchIds = branches.map((b: any) => b._id);

    // Resolve shift IDs matching shiftName
    const ShiftModel = mongoose.model("Shift");
    const shifts = await ShiftModel.find({ shiftName: regex }).select("_id").lean();
    const shiftIds = shifts.map((s: any) => s._id);

    // OR across all three dimensions
    assignmentFilter.$or = [
      { employeeId: { $in: employeeIds } },
      { branchId: { $in: branchIds } },
      { shiftId: { $in: shiftIds } },
    ];
  } else if (role) {
    // No search term but role filter present — filter by employee role only
    const UserModel = mongoose.model("User");
    const employees = await UserModel.find({ role }).select("_id").lean();
    assignmentFilter.employeeId = { $in: employees.map((e: any) => e._id) };
  }

  const [assignments, total] = await Promise.all([
    EmployeeBranchShiftModel.find(assignmentFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("employeeId", "firstName lastName role email")
      .populate("branchId", "title")
      .populate("shiftId", "shiftName")
      .lean(),
    EmployeeBranchShiftModel.countDocuments(assignmentFilter),
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
  // role is passed for Joi validation only — strip before saving
  const { role: _role, ...data } = body;

  await enforceCounterLimit(data.branchId, data.counterNo);

  try {
    const assignment = await EmployeeBranchShiftModel.create(data);

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

export const updateAssignment = async (assignmentId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw new ApiError("Invalid assignment ID", 400);

  const existing = await EmployeeBranchShiftModel.findById(assignmentId);
  if (!existing) throw new ApiError("Assignment not found", 404);

  // role is passed for Joi validation only — strip before building update
  const { role: _role, ...rest } = body;

  const ALLOWED = [
    "employeeId", "branchId", "shiftId",
    "effectiveFrom", "minuteOfSlots", "counterNo",
  ];

  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (rest[key] !== undefined) update[key] = rest[key];
  }

  // Resolve effective branchId and counterNo after this update
  const effectiveBranchId = rest.branchId
    ? String(rest.branchId)
    : String((existing as any).branchId);
  const effectiveCounterNo =
    rest.counterNo !== undefined ? rest.counterNo : (existing as any).counterNo;

  await enforceCounterLimit(effectiveBranchId, effectiveCounterNo);

  try {
    const updated = await EmployeeBranchShiftModel.findByIdAndUpdate(
      assignmentId,
      { $set: update },
      { new: true, runValidators: true },
    )
      .populate("employeeId", "firstName lastName role")
      .populate("branchId", "title")
      .populate("shiftId", "shiftName")
      .lean();

    return updated;
  } catch (error: any) {
    if (error.code === 11000)
      throw new ApiError(
        "This employee is already assigned to this branch and shift.",
        409,
      );
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
