import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { positionResponse } from "@/Types/ApiResponse/leadRes.types";
import { countryResponse, pathwayResponse } from "@/Types/ApiResponse/pathway.types";
import { AxiosResponse } from "axios";

export const getPathwayTopLevelAction = async (): Promise<AxiosResponse<pathwayResponse>> => {
    const res = await axiosClient.get(`/pathways`);
    return res;
};

export const getCountriesAction = async (): Promise<AxiosResponse<countryResponse>> => {
    const res = await axiosClient.get(`/countries`);
    return res;
};


export const getPathwayPositionsAction = async (
    { pathwayId }: { pathwayId?: string } = {}
): Promise<AxiosResponse<positionResponse>> => {
    const res = await axiosClient.get(
        `/document/positions-by-pathway?id=${pathwayId ?? ""}`
    );

    return res;
};