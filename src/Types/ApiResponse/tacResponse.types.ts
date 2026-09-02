import { ILead } from "@/lib/models/Lead.model"
import { CandidateRow, lastAssignmentData, QuestionType } from "../object.types"
import { IAssignment } from "@/lib/models/Assignment.model"
import { IGeneralSetting } from "@/lib/models/GeneralSetting.model"
import { IAssessment } from "@/lib/models/Assessment.model"


export interface CandidatesResponse {
    success: boolean,
    message: string,
    data: {
        data: CandidateRow[],
        pagination: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
            hasNextPage: boolean,
            hasPrevPage: boolean
        },
        kpis: {
            openCases: number,
            pendingCounselling: number,
            pendingAssessment: number
            // dueToday: number,
            // escalationsRaised: number,
            unassignedInquiries: number
        },
        todaySchedule: todaySchedule[]
    },
    error: null
}
export interface TacAssessmentResponse {
    success: boolean,
    message: string,
    data: {
        _id: string,
        leadId: string,
        phase: string,
        assignedTo: string,
        schedule: {
            date: string,
            from: string,
            to: string,
            method: string
        },
        status: string,
        token: {
            generated: boolean
        },
        attended: boolean,
        transfer: {
            requested: boolean
        },
        createdAt: string,
        updatedAt: string
    },
    error: null
}

export interface QuestionsListReponse {
    success: boolean,
    message: string,
    data: {
        data: QuestionType[],
        pagination: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
            hasNextPage: boolean,
            hasPrevPage: boolean
        }
    },
    error: string
}

export interface candidateDetailResponse {
    success: boolean,
    message: string,
    data: {
        lead: ILead,
        branchToken: null,
        assignments: IAssignment[],
        assignmentByPhase: Record<string, IAssignment>,
        generalSettings: IGeneralSetting,
        assessResult: IAssessment
    },
    error: null
}

export interface sendEmailRes {
    success: boolean,
    message: string,
    data: null,
    error: null
}
export interface todaySchedule {
    _id: string,
    leadId: {
        _id: string,
        fullName: string
    },
    phase: string,
    schedule: {
        date: string,
        from: string,
        to: string,
        method: string
    },
    status: string
}

export interface TacRatingResponse {
    success: boolean;
    message: string;
    data: any;
}

export interface LeadLastAppointmentResponse {
    success: boolean;
    message: string;
    data: lastAssignmentData,
    error: null
}

export interface ITacUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string | null;
}

export interface IRatedByUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ITacRatingItem {
  _id: string;
  leadId: string;
  phase: string;
  tacId: ITacUserRef;
  ratedBy: IRatedByUserRef;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GetTacRatingsData {
  totalRatings: number;
  averageRating: number;
  ratings: ITacRatingItem[];
}

export interface GetTacRatingsResponse {
  success: boolean;
  message: string;
  data: GetTacRatingsData;
  error: string | null;
}