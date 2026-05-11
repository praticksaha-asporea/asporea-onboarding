import Joi from "joi";

const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const scheduleSchema = Joi.object({
  days: Joi.array()
    .items(Joi.string().valid(...validDays))
    .min(1)
    .required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  breakTime: Joi.string().allow("", null).optional(),
});

export const createShiftSchema = Joi.object({
  shiftName: Joi.string().trim().required(),
  schedules: Joi.array().items(scheduleSchema).min(1).required(),
}).options({ abortEarly: false, allowUnknown: false });

export const updateShiftSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  shiftName: Joi.string().trim().optional(),
  schedules: Joi.array().items(scheduleSchema).optional(),
}).options({ abortEarly: false, allowUnknown: false });
