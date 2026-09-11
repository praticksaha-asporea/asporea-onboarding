import { Schema, Document, Types, model, models } from "mongoose";

export interface IReminder extends Document {
  notifyTo: Types.ObjectId;
  notifyType: "candidate" | "tac";
  sentFrom: Types.ObjectId;
  heading: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    notifyTo: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    notifyType: {
      type: String,
      enum: ["candidate", "tac"],
      required: true,
    },
    sentFrom: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Reminder =
  models.Reminder || model<IReminder>("Reminder", ReminderSchema);
