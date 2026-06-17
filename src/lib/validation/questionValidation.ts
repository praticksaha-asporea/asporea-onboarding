import Joi from "joi";

 
const ALLOWED_SECTIONS = [
  "ACADEMIC",
  "PROFESSIONAL",
  "LANGUAGE",
  "GENERAL",
  "WORK_EXP",
  "ABROAD_EXP",
  "STABILITY",
  "CAREER_INIT",
  "AGE",
  "LICENSE",
  "ADAPTABILITY"
];

export const createQuestionSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title / Question option is required",
  }),
  shortName: Joi.string().trim().allow("", null).optional(),
  marks: Joi.number().min(0).default(0),
  section: Joi.string().valid(...ALLOWED_SECTIONS).required().messages({
    "any.only": "Invalid section token sent to server",
    "string.empty": "Section key code is required",
  }),
  subSection: Joi.string().trim().allow("", null).optional(),
  type: Joi.string().valid("rating", "boolean", "text").default("rating"),
  levels: Joi.array().items(Joi.string().trim()).default([]),
  order: Joi.number().default(0),
});