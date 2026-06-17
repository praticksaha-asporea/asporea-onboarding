import { AssessmentQuestionModel } from "../../models/AssessmentQuestion.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";

export const questionList = async ({
  keyword,
  section,
  includeDeleted,
  page = 1,
  limit = 10,
}: {
  keyword?: string;
  section?: string;
  includeDeleted?: string | boolean;  
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;
  const match: Record<string, unknown> = {};
 
  if (includeDeleted === "true" || includeDeleted === true) {
     match.isDeleted = true;
  } else {
    
    match.isDeleted = { $ne: true };
  }
  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), "i");
    match.$or = [{ title: regex }, { shortName: regex }];
  }

  if (section && section.trim().length > 0) {
    match.section = section.trim();
  }

  const [questions, total] = await Promise.all([
    AssessmentQuestionModel.find(match)
      .sort({ section: 1, order: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AssessmentQuestionModel.countDocuments(match),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: questions,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const createQuestion = async (body: any) => {
  const { title, shortName, marks, section, subSection, type, levels, order } =
    body;

  
  if (shortName && shortName.trim().length > 0) {
    const existing = await AssessmentQuestionModel.findOne({
      shortName: { $regex: new RegExp(`^${shortName.trim()}$`, "i") },
      isDeleted: { $ne: true }
    });

    if (existing)
      throw new ApiError(
        "An assessment option with this unique shortName already exists", 
        409
      );
  }

  const cleanLevels =
    levels && Array.isArray(levels)
      ? levels.filter((lvl: string) => lvl && lvl.trim() !== "")
      : [];

  const question = await AssessmentQuestionModel.create({
    title,
    shortName,
    marks,
    section,
    subSection,
    type,
    levels: cleanLevels,
    order,
    isDeleted: false
  });

  return question;
};

export const viewQuestion = async (questionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(questionId))
    throw new ApiError("Invalid question ID parameter", 400);

 const question = await AssessmentQuestionModel.findOne({
    _id: questionId,
    isDeleted: { $ne: true }
  }).lean();
  if (!question)
    throw new ApiError("Requested assessment parameter not found or has been deleted", 404);

  return question;
};

export const updateQuestion = async (questionId: string, body: any) => {
  if (!mongoose.Types.ObjectId.isValid(questionId))
    throw new ApiError("Invalid question ID parameter", 400);

  const question = await AssessmentQuestionModel.findOne({
    _id: questionId,
    isDeleted: { $ne: true }
  });
  if (!question)
    throw new ApiError("Requested assessment parameter not found or has been deleted", 404);
 
  if (body.shortName && body.shortName.trim().length > 0) {
    const existing = await AssessmentQuestionModel.findOne({
      shortName: { $regex: new RegExp(`^${body.shortName.trim()}$`, "i") },
      _id: { $ne: questionId }  ,
      isDeleted: { $ne: true }
    });

    if (existing)
      throw new ApiError(
        "Another parameter configuration is already using this unique shortName", 
        409
      );
  }

  const ALLOWED = [
    "title",
    "shortName",
    "marks",
    "section",
    "subSection",
    "type",
    "levels",
    "order",
  ];
  let update: Record<string, unknown> = {};

  for (const key of ALLOWED) {
    if (body[key] !== undefined) {
      if (key === "levels" && Array.isArray(body[key])) {
        update[key] = body[key].filter(
          (lvl: string) => lvl && lvl.trim() !== "",
        );
      } else {
        update[key] = body[key];
      }
    }
  }

  const updated = await AssessmentQuestionModel.findByIdAndUpdate(
    questionId,
    { $set: update },
    { new: true, runValidators: true },
  );

  return updated;
};

export const deleteQuestion = async (questionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(questionId))
    throw new ApiError("Invalid question ID parameter", 400);

   
  const question = await AssessmentQuestionModel.findByIdAndUpdate(
    questionId,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!question)
    throw new ApiError("Requested assessment parameter not found", 404);

  return { success: true, message: "Parameter soft-deleted successfully" };
};

export const restoreQuestion = async (questionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(questionId))
    throw new ApiError("Invalid question ID parameter", 400);

   
  const question = await AssessmentQuestionModel.findByIdAndUpdate(
    questionId,
    { $set: { isDeleted: false } },
    { new: true }
  );

  if (!question)
    throw new ApiError("Requested assessment parameter not found", 404);

  return question;
};