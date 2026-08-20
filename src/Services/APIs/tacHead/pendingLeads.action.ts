import { AxiosResponse } from "axios";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import {
    TacHeadPendingLeadsParams,
    TacHeadPendingLeadsApiResponse,
} from "@/Types/ApiResponse/tacHead.types";

export const getTacHeadPendingTrackingAction = async (
    params: TacHeadPendingLeadsParams,
): Promise<AxiosResponse<TacHeadPendingLeadsApiResponse>> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.stageFilter) query.set("stageFilter", params.stageFilter);

    return await axiosClient.get<TacHeadPendingLeadsApiResponse>(
        `tac/tachead/pending-leads?${query.toString()}`,
    );
};
