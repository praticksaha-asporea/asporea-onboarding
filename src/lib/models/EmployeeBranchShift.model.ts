import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmployeeBranchShift extends Document {
  employeeId: Types.ObjectId;
  branchId: Types.ObjectId;
  shiftId: Types.ObjectId;

  effectiveFrom?: Date;

  minuteOfSlots?: number;
  counterNo?: number;

  createdAt: Date;
  updatedAt: Date;
}

const EmployeeBranchShiftSchema = new Schema<IEmployeeBranchShift>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      index: true,
    },

    effectiveFrom: {
      type: Date,
      default: Date.now,
      index: true,
    },

    minuteOfSlots: {
      type: Number,
      default: 30, // default slot duration
    },

    counterNo: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// prevent duplicate assignment of same employee in same shift/branch
EmployeeBranchShiftSchema.index(
  { employeeId: 1, branchId: 1, shiftId: 1 },
  { unique: true }
);

// for scheduling queries
EmployeeBranchShiftSchema.index({
  branchId: 1,
  shiftId: 1,
});

/* ================= EXPORT ================= */

export const EmployeeBranchShiftModel =
  mongoose.models.EmployeeBranchShift ||
  mongoose.model<IEmployeeBranchShift>(
    "EmployeeBranchShift",
    EmployeeBranchShiftSchema
  );