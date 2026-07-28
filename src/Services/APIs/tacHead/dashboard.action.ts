import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";

export const getTacHeadCandidatesAction = async (): Promise<AxiosResponse<any>> => {
    const res = await axiosClient.get(`/tac/tachead/candidates`);
    return res;
};
