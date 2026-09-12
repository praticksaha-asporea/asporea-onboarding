import Joi from "joi";

export const updateAssessAssignmentSchema = Joi.object({
  assignmentId: Joi.string()
    .hex()
    .length(24)
    .required(),

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
}).options({
  abortEarly: false,
  allowUnknown: true, // IMPORTANT for multipart/form-data
});