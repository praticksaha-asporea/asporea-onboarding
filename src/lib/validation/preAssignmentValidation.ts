import Joi from "joi";

export const updatePreAssignmentSchema = Joi.object({
  assignmentId: Joi.string()
    .hex()
    .length(24)
    .required(),

  preStatus: Joi.string()
    .valid(
      "assigned",
      "contacted",
      "na",
      "queued",
      "completed",
      "rejected",
      "not_responded"
    )
    .optional(),

  status: Joi.string()
    .valid(
      "assigned",
      "contacted",
      "na",
      "queued",
      "completed",
      "rejected",
      "not_responded"
    )
    .optional(),

  additionalDetails: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  specificNotes: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  advice: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  offeredPosition: Joi.string()
    .hex()
    .length(24)
    .optional(),
}).options({
  abortEarly: false,
  allowUnknown: true, // IMPORTANT for multipart/form-data
});