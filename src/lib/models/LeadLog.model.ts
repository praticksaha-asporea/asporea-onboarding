import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILeadLog extends Document {
  leadId: Types.ObjectId;
  actionType: string;
  actionNote: string;
  actionBy?: Types.ObjectId;
  triggeredBy: "USER" | "SYSTEM";
  eventDate?: Date;
  createdAt: Date;
}

const LeadLogSchema = new Schema<ILeadLog>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      trim: true,
    },
    actionNote: {
      type: String,
      required: true,
      trim: true,
    },
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    triggeredBy: {
      type: String,
      enum: ["USER", "SYSTEM"],
      required: true,
      default: "SYSTEM",
    },
    eventDate: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Indexes
LeadLogSchema.index({ leadId: 1, createdAt: -1 });
LeadLogSchema.index({ leadId: 1, triggeredBy: 1 });

export const LeadLog =
  (mongoose.models.LeadLog as mongoose.Model<ILeadLog>) ||
  mongoose.model<ILeadLog>("LeadLog", LeadLogSchema);

export default LeadLog;

/* 
ACTION TYPES:-
. LEAD & INQUIRY MANAGEMENT:
   - LOGIN                          -> User login with active lead
   - LEAD_GENERATED_BY_CANDIDATE    -> Step 1 Inquiry first-time creation
   - INQUIRY_STEP1_UPDATED          -> Step 1 Inquiry re-submission/update
   - LEAD_STEP2_UPDATED             -> Step 2 Inquiry (Source & Qualification) details submitted

. PRE-COUNSELLING SCHEDULING:
   - PRE_SCHEDULED                  -> General Pre-Counselling scheduled
   - PRE_SCHEDULED_BY_CANDIDATE     -> Pre-Counselling scheduled by Candidate
   - PRE_SCHEDULED_BY_FOE           -> Pre-Counselling scheduled by FOE
   - PRE_SCHEDULED_BY_TAC           -> Pre-Counselling scheduled by TAC
   - PRE_SCHEDULED_BY_TAC_HEAD      -> Pre-Counselling scheduled by TAC Head
   - PRE_SCHEDULED_BY_ADMIN         -> Pre-Counselling scheduled by Admin

. PRE-COUNSELLING CANCELLATION:
   - PRE_CANCELLED_BY_CANDIDATE     -> Pre-Counselling cancelled by Candidate
   - PRE_CANCELLED_BY_FOE           -> Pre-Counselling cancelled by FOE
   - PRE_CANCELLED_BY_TAC           -> Pre-Counselling cancelled by TAC
   - PRE_CANCELLED_BY_TAC_HEAD      -> Pre-Counselling cancelled by TAC Head
   - PRE_CANCELLED_BY_ADMIN         -> Pre-Counselling cancelled by Admin

.PRE_RESCHEDULED_BY_CANDIDATE  -> Pre-Counselling rescheduled by Candidate
  PRE_RESCHEDULED_BY_FOE        -> Pre-Counselling rescheduled by FOE
  PRE_RESCHEDULED_BY_TAC        -> Pre-Counselling rescheduled by TAC
  PRE_RESCHEDULED_BY_TAC_HEAD   -> Pre-Counselling rescheduled by TAC Head
  PRE_RESCHEDULED_BY_ADMIN      -> Pre-Counselling rescheduled by Admin

.TAC PRE-COUNSELLING STATUS UPDATES:
   - PRE_QUEUED_BY_TAC              -> Candidate moved to queue by TAC
   - PRE_CONTACTED_BY_TAC           -> Session marked contacted by TAC
   - PRE_COMPLETED_BY_TAC           -> Session marked completed by TAC
   - PRE_REJECTED_BY_TAC            -> Session marked rejected by TAC
   - PRE_NOT_RESPONDED_BY_TAC       -> Candidate marked unattended by TAC

. DOCUMENT SUBMISSION STAGE:
   - DOCUMENT_SUBMITTED_BY_CANDIDATE -> Documents submitted by Candidate
   - DOCUMENT_SUBMITTED_BY_FOE       -> Documents uploaded/submitted by FOE

. EXPERIENCE SUBMISSION STAGE:
   - EXPERIENCE_SUBMITTED_BY_CANDIDATE -> Experience type (Fresher/Domestic/etc.) submitted by Candidate
   - EXPERIENCE_SUBMITTED_BY_FOE       -> Experience type updated by FOE

. LEAD DETAILS MODIFICATION STAGE:
   - LEAD_DETAILS_UPDATED_BY_FOE       -> Lead/Candidate details updated by FOE
   - LEAD_DETAILS_UPDATED_BY_TAC       -> Lead/Candidate details updated by TAC
*/
