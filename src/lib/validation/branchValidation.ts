import Joi from "joi";

const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const createBranchSchema = Joi.object({
  title: Joi.string().trim().required(),
  location: Joi.string().trim().required(),
  counters: Joi.number().min(0).default(0).optional(),
  timeZone: Joi.string().trim().default("Asia/Kolkata").optional(),
  workDays: Joi.array()
    .items(Joi.string().valid(...validDays))
    .optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
}).options({ abortEarly: false, allowUnknown: false });

export const updateBranchSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  counters: Joi.number().min(0).optional(),
  timeZone: Joi.string().trim().optional(),
  workDays: Joi.array()
    .items(Joi.string().valid(...validDays))
    .optional(),    
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
}).options({ abortEarly: false, allowUnknown: false });
