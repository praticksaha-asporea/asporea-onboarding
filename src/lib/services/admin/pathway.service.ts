import mongoose from "mongoose";
import { Pathway } from "@/lib/models/Pathway.model";
import { ApiError } from "@/lib/error/api.error";
import "@/lib/models/Country.model"

// CREATE
export const createPathwayService = async (title: string, underPathway: string = "", country: string) => {
  if (!title || !title.trim()) {
    throw new ApiError("Pathway title is required", 400);
  }

  const cleanUnderPathway = underPathway.trim();
  const cleanCountry = country?.trim();


  if (cleanUnderPathway) {
    if (!mongoose.Types.ObjectId.isValid(cleanUnderPathway)) {
      throw new ApiError("Invalid Parent Pathway ID format", 400);
    }

    const parentExists = await Pathway.findById(cleanUnderPathway);
    if (!parentExists) {
      throw new ApiError("Parent Pathway does not exist", 404);
    }
  }

  const existingPathway = await Pathway.findOne({
    title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    underPathway: cleanUnderPathway
  });

  if (existingPathway) {
    throw new ApiError("Pathway with this title already exists in the selected category", 400);
  }

  return await Pathway.create({
    title: title.trim(),
    underPathway: cleanUnderPathway,
    ...(cleanCountry && { countryId: cleanCountry }),
  });
};

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

// UPDATE
export const updatePathwayService = async (
  pathwayId: string,
  data: { title?: string; underPathway?: string; isActive?: boolean }
) => {
  if (!pathwayId || !mongoose.Types.ObjectId.isValid(pathwayId)) {
    throw new ApiError("Valid Pathway ID is required", 400);
  }

  if (data.underPathway !== undefined && data.underPathway.trim() !== "") {
    const cleanUnderPathway = data.underPathway.trim();

    if (!mongoose.Types.ObjectId.isValid(cleanUnderPathway)) {
      throw new ApiError("Invalid Parent Pathway ID format", 400);
    }

    if (cleanUnderPathway === pathwayId) {
      throw new ApiError("A pathway cannot be its own parent", 400);
    }

    const parentExists = await Pathway.findById(cleanUnderPathway);
    if (!parentExists) {
      throw new ApiError("Parent Pathway does not exist", 404);
    }
  }

  const updateFields: Record<string, any> = {};

  if (data.title !== undefined) updateFields.title = data.title.trim();
  if (data.underPathway !== undefined) updateFields.underPathway = data.underPathway.trim();
  if (data.isActive !== undefined) updateFields.isActive = data.isActive;

  // Check if updated title & underPathway combo already exists (excluding self)
  if (updateFields.title || updateFields.underPathway !== undefined) {
    const checkTitle = updateFields.title || (await Pathway.findById(pathwayId))?.title;
    const checkUnderPathway = updateFields.underPathway !== undefined ? updateFields.underPathway : (await Pathway.findById(pathwayId))?.underPathway;

    const existing = await Pathway.findOne({
      _id: { $ne: new mongoose.Types.ObjectId(pathwayId) },
      title: { $regex: new RegExp(`^${checkTitle}$`, "i") },
      underPathway: checkUnderPathway
    });

    if (existing) {
      throw new ApiError("Another pathway with this title already exists in this category", 400);
    }
  }

  const updatedPathway = await Pathway.findByIdAndUpdate(
    pathwayId,
    { $set: updateFields },
    { new: true }
  );

  if (!updatedPathway) {
    throw new ApiError("Pathway not found", 404);
  }

  return updatedPathway;
};

// DELETE
export const deletePathwayService = async (pathwayId: string) => {
  if (!pathwayId || !mongoose.Types.ObjectId.isValid(pathwayId)) {
    throw new ApiError("Valid Pathway ID is required", 400);
  }

  // Delete all children under this parent
  await Pathway.deleteMany({ underPathway: pathwayId });

  const deletedDoc = await Pathway.findByIdAndDelete(pathwayId);
  if (!deletedDoc) throw new ApiError("Pathway not found", 404);

  return { pathwayId };
};