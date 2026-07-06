import mongoose, {
  Schema,
  Document,
  Types,
  model,
  models,
} from "mongoose";

export const ASSIGNMENT_PHASES = [
  // "inq",
  "pre",
  "assess",
  // "tech",
] as const;

export const ASSIGNMENT_STATUS = [
  "assigned",
  "contacted",
  "queued",
  "completed",
  "rejected",
  "not_responded",
] as const;

export type AssignmentPhase =
  typeof ASSIGNMENT_PHASES[number];

export type AssignmentStatus =
  typeof ASSIGNMENT_STATUS[number];

export interface IAssignment extends Document {
  leadId: Types.ObjectId;

  phase: AssignmentPhase;

  assignedTo?: Types.ObjectId;

  schedule?: {
    date?: Date;
    from?: string;
    to?: string;
    method?: "on" | "off";
  };

  status: AssignmentStatus;

  token?: {
    generated: boolean;
    number?: string;
  };

  attended: boolean;

  pre?: {
    additionalDetails?: string;
    advice?: string;
    specificNotes?: string;
    initialCV?: Types.ObjectId;
  };

  escalation?: {
    requested: boolean;
    escalatedTo?: Types.ObjectId;
  };

  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    phase: {
      type: String,
      enum: ASSIGNMENT_PHASES,
      required: true,
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    schedule: {
      date: {
        type: Date,
        default: null,
        index: true,
      },
      from: String,
      to: String,
      method: {
        type: String,
        enum: ["on", "off"],
      },
    },

    status: {
      type: String,
      enum: ASSIGNMENT_STATUS,
      default: "assigned",
      index: true,
    },

    token: {
      generated: {
        type: Boolean,
        default: false,
      },

      number: {
        type: String,
        trim: true,
        index: true,
      },
    },

    attended: {
      type: Boolean,
      default: false,
    },

    pre: {
      additionalDetails: {
        type: String,
        trim: true,
      },

      advice: {
        type: String,
        trim: true,
      },

      specificNotes: {
        type: String,
        trim: true,
      },

      initialCV: {
        type: Schema.Types.ObjectId,
        ref: "Upload",
      },
    },

    escalation: {
      requested: {
        type: Boolean,
        default: false,
      },

      escalatedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Compound Indexes
 */

AssignmentSchema.index(
  { leadId: 1, phase: 1 },
  { unique: true }
);

AssignmentSchema.index({
  assignedTo: 1,
  "schedule.date": 1,
  "token.generated": 1,
  status: 1,
});

AssignmentSchema.index({
  "token.number": 1,
});

/**
 * Optional:
 * Automatically remove empty nested objects
 */

AssignmentSchema.set("minimize", true);

export const Assignment =
  models.Assignment ||
  model<IAssignment>("Assignment", AssignmentSchema);

