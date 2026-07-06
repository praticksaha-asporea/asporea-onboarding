import Joi from "joi";

export const createSectionSchema = Joi.object({
  section: Joi.string().required().trim().messages({
    "any.required": "Section name is required",
  }),
  shortName: Joi.string().required().trim().messages({
    "any.required": "Short name is required",
  }),
  underSection: Joi.string().allow("").default(""),
  maxScore: Joi.number().when("underSection", {
    
    is: Joi.valid("", null).optional(),
    then: Joi.number().required().messages({
      "any.required": "Max score is mandatory for a main parent section",
    }),
    otherwise: Joi.number().optional().allow(null),
  }),
});