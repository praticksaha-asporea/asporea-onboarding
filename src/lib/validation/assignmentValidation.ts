import Joi from "joi";

export const updateAssignmentSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required(),
  passportNo: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  totalMarks: Joi.string()
    .required(),
  note1: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  note2: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  note3: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  note4: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
}).options({
  abortEarly: false,
  allowUnknown: true, // IMPORTANT for multipart/form-data
});