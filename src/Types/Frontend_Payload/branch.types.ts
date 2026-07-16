import { Counter } from "../object.types"

export interface BranchListingPayload {
    lat: number,
    lng: number
};

export interface branchTokensPayload {
    branchId: string,
    counters: Counter[]
}

export interface branchById {
    branchId: string
}

export interface externalSourceByType {
    type: string
}