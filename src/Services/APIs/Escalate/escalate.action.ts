import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";

export const createEscalateAction = async (payload: any): Promise<AxiosResponse<any>> => {
    const response = await axiosClient.post("/escalate/create", payload);
    return response
};