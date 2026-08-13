import { ICountry } from "@/lib/models/Country.model"
import { IPathway } from "@/lib/models/Pathway.model"

export interface pathwayResponse {
    success: boolean,
    message: string,
    data: IPathway[],
    error: null
}
export interface countryResponse {
    success: boolean,
    message: string,
    data: ICountry[],
    error: null
}