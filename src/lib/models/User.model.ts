import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;

  password?: string;
  role?: "admin" | "tac" | "user" | "reception" | "finance" | "coordinator" | "pca" | "pcra" | "institute" | "sub_pca" | "branch_head" | "tac_head",
  passportStatus?: "having" | "not" | "applied";
  passportNo: string;
  enquired?: boolean;

  status?: "active" | "inactive" | "deleted";

  profilePic?: Types.ObjectId;

  notificationPreference?: {
    sms?: boolean;
    whatsapp?: boolean;
    email?: boolean;
  };

  reviewer?: Types.ObjectId;
  createdBy?: Types.ObjectId;

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

    enquired: Boolean,

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
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;