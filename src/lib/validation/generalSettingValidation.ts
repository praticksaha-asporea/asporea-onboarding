import Joi from "joi";

export const updateGeneralSettingsSchema = Joi.object({
  escalationTimelineHours: Joi.number().min(1).optional().messages({
    "number.base": "Escalation Timeline must be a number",
    "number.min": "Escalation Timeline must be minimum 1 Hour",
  }),
  inqResTimelineHours: Joi.number().min(1).optional().messages({
    "number.base": "Inquiry Response Timeline must be a number",
    "number.min": "Inquiry Response Timeline must be minimum 1 Hour",
  }),
  preCounsellingTimelineHours: Joi.number().min(1).optional().messages({
    "number.base": "Pre Counselling Timeline must be a number",
    "number.min": "Pre Counselling Timeline must be minimum 1 Hour",
  }),
  assessmentTimelineHours: Joi.number().min(1).optional().messages({
    "number.base": "Assessment Timeline must be a number",
    "number.min": "Assessment Timeline must be minimum 1 Hour",
  }),
  tacAssignmentType: Joi.string().valid("random", "counterwise").optional(),
  inquiryNumberFormat: Joi.string().trim().optional(),
  lastFy: Joi.string().trim().optional(),

  assessment: Joi.object({
    fullMarks: Joi.number()
      .min(0)
      .optional()
      .messages({ "number.base": "Full marks must be a number" }),
    passingMarks: Joi.number()
      .min(0)
      .optional()
      .messages({ "number.base": "Passing marks must be a number" }),
  }).optional(),

  technical: Joi.object({
    fullMarks: Joi.number()
      .min(0)
      .optional()
      .messages({ "number.base": "Full marks must be a number" }),
    passingMarks: Joi.number()
      .min(0)
      .optional()
      .messages({ "number.base": "Passing marks must be a number" }),
  }).optional(),
}).options({ abortEarly: false, allowUnknown: false });
