import Joi from "joi";

export const updateAssessDocumentSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required(),

  status: Joi.string()
    .valid("verified", "rejected", "awaiting_approval")
    .optional(),

  remarks: Joi.string().allow("", null).optional(),
}).options({
  abortEarly: false,
  allowUnknown: true,
});