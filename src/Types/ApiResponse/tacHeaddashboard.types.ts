import { technicalRequestedLeadRecord } from "./technicalRes.types"
import { escalationRecord } from "./transferRes.types"

export interface teamOverview {
    totalAssignments: number,
    assignedTo: string,
    firstName: string,
    lastName: string,
    profilePic: string
}
export interface tacHeadKpis {
    pendingTransfers: number,
    documentsAwaiting: number,
    pendingTechnical: number,
    candidatesSupervised: number
}
export interface TacHeadDashData {
    teamOverview: teamOverview[],
    recentTransfers: {
        transfers: escalationRecord[]
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