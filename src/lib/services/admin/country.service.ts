import mongoose from "mongoose";
import { Country } from "@/lib/models/Country.model";
import { ApiError } from "@/lib/error/api.error";

export const createCountryService = async (name: string, code?: string) => {
    if (!name || !name.trim()) {
        throw new ApiError("Country name is required", 400);
    }

    const existingCountry = await Country.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCountry) {
        throw new ApiError("Country with this name already exists", 400);
    }

    return await Country.create({
        name: name.trim(),
        ...(code && { code: code.trim().toUpperCase() }),
    });
};

export const getCountriesService = async (onlyActive: boolean = false) => {
    const query = onlyActive ? { isActive: true } : {};
    return await Country.find(query).sort({ name: 1 }).lean();
};

export const updateCountryService = async (
    countryId: string,
    data: { name?: string; code?: string; isActive?: boolean }
) => {
    if (!countryId || !mongoose.Types.ObjectId.isValid(countryId)) {
        throw new ApiError("Valid Country ID is required", 400);
    }

    const updateFields: Record<string, any> = {};

    if (data.name !== undefined) {
        if (!data.name.trim()) throw new ApiError("Country name cannot be empty", 400);

        const existing = await Country.findOne({
            _id: { $ne: new mongoose.Types.ObjectId(countryId) },
            name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
        });
        if (existing) {
            throw new ApiError("Another country with this name already exists", 400);
        }
        updateFields.name = data.name.trim();
    }

    if (data.code !== undefined) {
        updateFields.code = data.code.trim().toUpperCase();
    }

    if (data.isActive !== undefined) {
        updateFields.isActive = data.isActive;
    }

    const updatedCountry = await Country.findByIdAndUpdate(
        countryId,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedCountry) {
        throw new ApiError("Country not found", 404);
    }

    return updatedCountry;
};

export const deleteCountryService = async (countryId: string) => {
    if (!countryId || !mongoose.Types.ObjectId.isValid(countryId)) {
        throw new ApiError("Valid Country ID is required", 400);
    }

    const deletedDoc = await Country.findByIdAndDelete(countryId);
    if (!deletedDoc) throw new ApiError("Country not found", 404);

    return { countryId };
};