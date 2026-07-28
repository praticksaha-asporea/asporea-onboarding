import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { TacHeadDashRes } from "@/Types/ApiResponse/tacHeaddashboard.types";
import { AxiosResponse } from "axios";

export const getTacHeadCandidatesAction = async (): Promise<AxiosResponse<TacHeadDashRes>> => {
    const res = await axiosClient.get(`/tac/tachead/candidates`);
    return res;
};
