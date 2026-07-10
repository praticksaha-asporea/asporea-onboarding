import { Counter } from "../object.types"

export interface BranchListingPayload {
    lat: number,
    lng: number
};

export interface branchTokensPayload {
    branchId: string,
    counters: Counter[]
}