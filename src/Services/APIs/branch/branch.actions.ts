import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { BranchListing, CounterTokenListing } from "@/Types/ApiResponse/branchRes.types";
import { BranchListingPayload, branchTokensPayload } from "@/Types/Frontend_Payload/branch.types";
import { AxiosResponse } from "axios";

export const branchListingApi = async (bodyData: BranchListingPayload): Promise<AxiosResponse<BranchListing>> => {
    const response = await axiosClient.get(`/branch/list?lat=${bodyData?.lat}&lng=${bodyData?.lng}&radiusKm=5000&limit=50`);
    return response;
};


export const branchCountersApi = async (bodyData: branchTokensPayload): Promise<AxiosResponse<CounterTokenListing>> => {
    const response = await axiosClient.get(
        `/branch-token/list-counters?branchId=${bodyData.branchId}`,
    );
    return response;
};


export const branchCounterTokensApi = async (bodyData: branchTokensPayload): Promise<AxiosResponse<CounterTokenListing>> => {
    const response = await axiosClient.post(
        `/branch-token/list`, bodyData
    );
    return response;
};
