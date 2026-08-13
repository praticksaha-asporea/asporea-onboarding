import mongoose from "mongoose";
import { Pathway } from "@/lib/models/Pathway.model";
import { ApiError } from "@/lib/error/api.error";


export const getPathwaysService = async (onlyActive: boolean = false) => {
    const query = onlyActive ? { isActive: true } : {};
    return await Pathway.find(query).sort({ title: 1 }).lean();
};

export const getPathwayByIdService = async (pathwayId: string) => {
    if (!pathwayId || !mongoose.Types.ObjectId.isValid(pathwayId)) {
        throw new ApiError("Valid Pathway ID is required", 400);
    }

    const pathway = await Pathway.findById(pathwayId).lean();
    if (!pathway) throw new ApiError("Pathway not found", 404);

    return pathway;
};
