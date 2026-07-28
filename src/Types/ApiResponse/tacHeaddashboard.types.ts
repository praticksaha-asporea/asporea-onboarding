import { escalationRecord } from "./escalationRes.types"
import { technicalRequestedLeadRecord } from "./technicalRes.types"

export interface teamOverview {
    totalAssignments: number,
    assignedTo: string,
    firstName: string,
    lastName: string,
    profilePic: string
}
export interface tacHeadKpis {
    pendingEscalations: number,
    documentsAwaiting: number,
    pendingTechnical: number,
    candidatesSupervised: number
}
export interface TacHeadDashData {
    teamOverview: teamOverview[],
    recentEscalations: {
        escalations: escalationRecord[]
    },
    technicalReviews: {
        technicalRequestedLeads: technicalRequestedLeadRecord[],
    },
    kpis: tacHeadKpis
}
export interface TacHeadDashRes {
    success: boolean,
    message: string,
    data: TacHeadDashData,
    error: null
}