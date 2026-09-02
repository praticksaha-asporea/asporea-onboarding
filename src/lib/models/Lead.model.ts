import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./User.model";
import { IUpload } from "./Upload.model";

export interface ILead extends Document {
  fullName?: string;

  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };

  address?: string;

  preferences?: {
    branchId?: Types.ObjectId;
    consultantId?: Types.ObjectId;
    visitType?: "online" | "offline";
  };

  source?: {
    type?: "web_app" | "telecall" | "social" | "refer" | "none";
    refType?: "pca" | "pcra" | "institute" | "other";
    refName?: string;
  };

  status?: string;
  inqNo?: string;
  inqFy?: string;
  inqForType?: Types.ObjectId;
  inqForPosition?: Types.ObjectId;
  offeredPosition?: Types.ObjectId;
  followUpRequired?: boolean;
  followUpAssignedTo?: Types.ObjectId;
  candidateResume?: Types.ObjectId | IUpload;

  experience?: {
    type?: "fresher" | "domestic" | "abroad" | "free";
    submittedOn?: Date;
    status?: "selected" | "verified" | "rejected" | "request_technical";
    actionBy?: IUser;
  };

  documents?: {
    submittedOn?: Date;
    status?: "na" | "uploaded" | "verified" | "rejected" | "re_uploaded" | "re_verified" | "awaiting_approval";
    actionBy?: IUser;
    remarks?: string;
  };

  technical?: {
    required?: boolean;
    status?: "na" | "refered" | "passed" | "failed";
  };

  passport?: {
    status?: "no" | "applied" | "having";
    no?: string;
  };

  createdBy?: {
    id?: Types.ObjectId;
    type?: "self" | "tac" | "pca" | "pcra" | "sub_pca" | "institute";
  };

  transferredTo?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;// add to ILead interface
  inquiryStages?: {
    stage1?: "pending" | "done";
    stage2?: "pending" | "done";
    stage3?: "pending" | "done";
  };
}

const LeadSchema = new Schema<ILead>(
  {
    fullName: { type: String, trim: true },

    contact: {
      phone: { type: String, index: true },
      whatsapp: String,
      email: { type: String, lowercase: true },
    },

    address: String,

    preferences: {
      branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
      consultantId: { type: Schema.Types.ObjectId, ref: "User" },
      visitType: {
        type: String,
        enum: ["online", "offline"],
      },
    },

    source: {
      type: {
        type: String,
        enum: ["web_app", "telecall", "social", "refer", "none"],
      },
      refType: {
        type: String,
        enum: ["pca", "pcra", "institute", "other"],
      },
      refName: String,
    },

    status: {
      type: String,
      index: true,
    },

    inqNo: {
      type: String,
      sparse: true,
    },
    inqForType: {
      type: Schema.Types.ObjectId,
      ref: "Pathway"
    },
    inqForPosition: {
      type: Schema.Types.ObjectId,
      ref: "Position"
    },
    offeredPosition: {
      type: Schema.Types.ObjectId,
      ref: "Position"
    },
    inquiryStages: {
      stage1: { type: String, enum: ["pending", "done"], default: "pending" },
      stage2: { type: String, enum: ["pending", "done"], default: "pending" },
      stage3: { type: String, enum: ["pending", "done"], default: "pending" },
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpAssignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    candidateResume: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
    },
    inqFy: {
      type: String,
      sparse: true,
    },

    experience: {
      type: {
        type: String,
        enum: ["fresher", "domestic", "abroad", "free"],
      },
      submittedOn: Date,
      status: {
        type: String,
        enum: [
          "selected",
          "verified",
          "rejected",
          "request_technical"
        ]
      },
      actionBy: { type: Schema.Types.ObjectId, ref: "User" },
    },

    documents: {
      submittedOn: Date,
      position: { type: Schema.Types.ObjectId, ref: "Position" },
      status: {
        type: String,
        enum: [
          "na",
          "uploaded",
          "verified",
          "rejected",
          "re_uploaded",
          "re_verified",
        ]
      },
      remarks: String,
      actionBy: { type: Schema.Types.ObjectId, ref: "User" },
    },

    technical: {
      required: Boolean,
      status: {
        type: String,
        enum: ["na", "refered", "passed", "failed"],
      },
    },

    passport: {
      status: {
        type: String,
        enum: ["no", "applied", "having"],
      },
      no: String,
    },

    createdBy: {
      id: { type: Schema.Types.ObjectId, ref: "User" },
      type: {
        type: String,
        enum: ["self", "tac", "pca", "pcra", "sub_pca", "institute"],
      },
    },

    transferredTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
LeadSchema.index(
  { inqNo: 1, inqFy: 1 },
  { unique: true }
);

export const Lead =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);