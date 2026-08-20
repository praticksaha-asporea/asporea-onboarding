import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;

  password?: string;
  role?: "admin" | "tac" | "user" | "foe" | "finance" | "coordinator" | "pca" | "pcra" | "institute" | "branch_head" | "tac_head", //employer
  passportStatus?: "having" | "not" | "applied";
  passportNo: string;
  enquired?: "yes" | "no";

  status?: "active" | "inactive" | "deleted";

  profilePic?: Types.ObjectId;

  notificationPreference?: {
    sms?: boolean;
    whatsapp?: boolean;
    email?: boolean;
  };
  experienceInMonths?: number;
  bio?: string;

  reviewer?: Types.ObjectId;
  createdBy?: Types.ObjectId;

  // Only applicable when role === "user"
  candidateProfile?: {
    leadId?: Types.ObjectId;
    technicalQualification?: string;
    academic?: string;
    nationality?: string;
    workExp?: string;
  };

  // Only applicable when role === "tac"
  tacProfile?: {
    designation?: string;
    areasOfExp?: string[];
    languagesKnown?: string[];
    industryExp?: string[];
    specialization?: string[];
    mode?: "online" | "offline" | "both";
    rating?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },

    phoneNumber: String,
    whatsappNumber: String,
    address: String,

    password: String,
    role: String,

    passportStatus: {
      type: String,
      enum: ["having", "not", "applied"],
    },
    passportNo: String,

    enquired: String,

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },

    profilePic: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
    },

    notificationPreference: {
      sms: Boolean,
      whatsapp: Boolean,
      email: Boolean,
    },

    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    experienceInMonths: Number,
    bio: String,

    candidateProfile: {
      leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
      technicalQualification: { type: String, trim: true },
      academic: { type: String, trim: true },
      nationality: { type: String, trim: true },
      workExp: { type: String, trim: true },
    },

    tacProfile: {
      designation: { type: String, trim: true },
      areasOfExp: { type: [String], default: [] },
      languagesKnown: { type: [String], default: [] },
      industryExp: { type: [String], default: [] },
      specialization: { type: [String], default: [] },
      mode: {
        type: String,
        enum: ["online", "offline", "both"],
        default: "both",
      },
      rating: { type: Number, default: 0 },
    },

  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;