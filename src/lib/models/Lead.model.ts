import mongoose, { Schema, Document, Types } from "mongoose";

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

  experience?: {
    type?: "fresher" | "domestic" | "abroad" | "free";
    submittedOn?: Date;
  };

  documents?: {
    submittedOn?: Date;
    status?: "na" | "uploaded" | "verified" | "rejected" | "re_uploaded" | "re_verified";
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

  escalatedTo?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
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
      unique: true,
      sparse: true,
    },

    experience: {
      type: {
        type: String,
        enum: ["fresher", "domestic", "abroad", "free"],
      },
      submittedOn: Date,
    },

    documents: {
      submittedOn: Date,
      status: {
        type: String,
        enum: [
          "na",
          "uploaded",
          "verified",
          "rejected",
          "re_uploaded",
          "re_verified",
        ],
      },
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

    escalatedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Lead =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);