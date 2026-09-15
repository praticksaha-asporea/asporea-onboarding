import Joi from "joi";
export const getRemindersQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  read: Joi.string().valid("true", "false", "all").optional(),
  notifyType: Joi.string().valid("candidate", "tac", "all").optional(),
  sentFrom: Joi.string().hex().length(24).optional(),
  notifyTo: Joi.string().hex().length(24).optional(),
  search: Joi.string().trim().allow("", null).optional(),
}).options({ abortEarly: false, allowUnknown: true });
export const reminderIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid Reminder ID format",
    "any.required": "Reminder ID is required",
  }),
});
export const deleteReminderSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
