import Joi from "joi";

const objectIdSchema = Joi.string().hex().length(24);

const COUNTER_REQUIRED_ROLES = ["tac", "coordinator"];

export const createAssignmentSchema = Joi.object({
  employeeId: objectIdSchema
    .required()
    .messages({ "string.pattern.base": "Invalid Employee ID" }),
  branchId: objectIdSchema
    .required()
    .messages({ "string.pattern.base": "Invalid Branch ID" }),
  shiftId: objectIdSchema
    .required()
    .messages({ "string.pattern.base": "Invalid Shift ID" }),
  effectiveFrom: Joi.date().iso().optional(),
  minuteOfSlots: Joi.number().min(5).optional(),
  // role is passed by the caller so Joi can enforce counterNo — stripped before DB save
  role: Joi.string().optional(),
  counterNo: Joi.number().min(1).when("role", {
    is: Joi.valid(...COUNTER_REQUIRED_ROLES),
    then: Joi.required().messages({
      "any.required": "Counter no is required for tac and coordinator",
      "number.base": "Counter no must be a number",
    }),
    otherwise: Joi.optional(),
  }),
}).options({ abortEarly: false, allowUnknown: false });

export const updateAssignmentSchema = Joi.object({
  id: objectIdSchema.required().messages({ "any.required": "Assignment ID is required" }),
  employeeId: objectIdSchema.optional(),
  branchId: objectIdSchema.optional(),
  shiftId: objectIdSchema.optional(),
  effectiveFrom: Joi.date().iso().optional(),
  minuteOfSlots: Joi.number().min(5).optional(),
  // role is passed by the caller so Joi can enforce counterNo — stripped before DB save
  role: Joi.string().optional(),
  counterNo: Joi.number().min(1).when("role", {
    is: Joi.valid(...COUNTER_REQUIRED_ROLES),
    then: Joi.required().messages({
      "any.required": "Counter no is required for tac and coordinator",
      "number.base": "Counter no must be a number",
    }),
    otherwise: Joi.optional(),
  }),
}).options({ abortEarly: false, allowUnknown: false });
