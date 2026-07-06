import AssessmentSectionModel from "@/lib/models/AssessmentSection.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";

export const sectionList = async ({
  keyword,
  includeDeleted,
}: {
  keyword?: string;
  includeDeleted?: string | boolean;
}) => {
  const match: Record<string, unknown> = {};

  if (includeDeleted === "true" || includeDeleted === true) {
    match.isDeleted = true;
  } else {
    match.isDeleted = { $ne: true };
  }

  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), "i");
    match.$or = [{ section: regex }, { shortName: regex }];
  }

  const sections = await AssessmentSectionModel.find(match)
    .sort({ section: 1 })
    .lean();

  return {
    data: sections,
  };
};
export const getSectionById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid section ID", 400);
  }
  const section = await AssessmentSectionModel.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
  if (!section) throw new ApiError("Section not found", 404);
  return section;
};
export const createSection = async (body: any) => {
  const { section, shortName, underSection, maxScore } = body;
  

  if (shortName && shortName.trim().length > 0) {
    const existing = await AssessmentSectionModel.findOne({
      shortName: { $regex: new RegExp(`^${shortName.trim()}$`, "i") },
      isDeleted: { $ne: true },
    });

    if (existing)
      throw new ApiError(
        "An assessment section with this unique shortName already exists",
        409,
      );
  }

  const cleanUnderSection =
    underSection && underSection.trim().length > 0 ? underSection.trim() : "";
  if (cleanUnderSection === "" && maxScore !== undefined && Number(maxScore) >= 100) {
  throw new ApiError("Max score must be strictly less than 100", 400);
}
  const newSection = await AssessmentSectionModel.create({
    section: section.trim(),
    shortName: shortName.trim(),
    underSection: cleanUnderSection,
    maxScore: cleanUnderSection === "" ? Number(maxScore) : undefined,
    isDeleted: false,
  });

  return newSection;
};

export const deleteSection = async (sectionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(sectionId)) {
    throw new ApiError("Invalid section ID parameter", 400);
  }

  const section = await AssessmentSectionModel.findByIdAndUpdate(
    sectionId,
    { $set: { isDeleted: true } },
    { new: true },
  );

  if (!section) {
    throw new ApiError("Requested assessment section not found", 404);
  }

  return { success: true, message: "Section soft-deleted successfully" };
};

export const updateSection = async (sectionId: string, body: any) => {
  const { section, shortName, underSection, maxScore } = body;
  const cleanUnderSection = underSection && underSection.trim().length > 0 ? underSection.trim() : "";

  if (cleanUnderSection === "" && maxScore !== undefined && Number(maxScore) >= 100) {
  throw new ApiError("Max score must be less than 100", 400);
}

  if (shortName && shortName.trim().length > 0) {
    const existing = await AssessmentSectionModel.findOne({
      _id: { $ne: sectionId },
      shortName: { $regex: new RegExp(`^${shortName.trim()}$`, "i") },
      isDeleted: { $ne: true },
    });

    if (existing) {
      throw new ApiError(
        "This shortName is already in use by another section",
        409,
      );
    }
  }
 

  const updatedSection = await AssessmentSectionModel.findByIdAndUpdate(
    sectionId,
    {
      section: section.trim(),
      shortName: shortName.trim(),
      underSection: cleanUnderSection,
      maxScore: cleanUnderSection === "" ? Number(maxScore) : undefined,
    },
    { new: true },
  );

  if (!updatedSection) {
    throw new ApiError("Assessment section not found", 404);
  }

  return updatedSection;
};
