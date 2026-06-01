import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssignment extends Document {
  leadId: Types.ObjectId;
  phase: "inq" | "pre" | "assess" | "tech";

  assignedTo?: Types.ObjectId;

  schedule?: {
    date?: Date;
    from?: string;
    to?: string;
    method?: "on" | "off";
  };

  status?: "assigned" | "contacted" | "na" | "queued" | "completed" | "rejected" | "not_responded";

  token?: {
    generated?: boolean;
    number?: string;
  };

  attended?: boolean;

  escalation?: {
    requested?: boolean;
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
      enum: ["inq", "pre", "assess", "tech"],
      required: true,
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    schedule: {
      date: {
        type: Date,
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
      enum: ["assigned", "contacted", "na", "queued", "completed", "rejected","not_responded"],
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
        index: true,
      },
    },

    attended: {
      type: Boolean,
      default: false,
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
  { timestamps: true }
);


AssignmentSchema.index({ leadId: 1, phase: 1 });

AssignmentSchema.index({
  assignedTo: 1,
  "schedule.date": 1,
});

AssignmentSchema.index({
  phase: 1,
  status: 1,
});

AssignmentSchema.index({
  "token.number": 1,
});

 
export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);