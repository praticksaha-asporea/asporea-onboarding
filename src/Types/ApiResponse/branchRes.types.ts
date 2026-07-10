import { branchDB, Counter } from "../object.types"

export interface BranchListing {
    success: boolean,
    message: string,
    data: {
        data: [
            branchDB[]
        ],
        pagination: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
            hasNextPage: boolean,
            hasPrevPage: boolean
        }
    },
    error: null
}

export interface CounterTokenListing {
    success: boolean,
    message: string,
    data: Counter[],
    error: null
}