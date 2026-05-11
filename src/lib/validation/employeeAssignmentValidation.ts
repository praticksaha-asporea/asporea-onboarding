import Joi from "joi";

const objectIdSchema = Joi.string().hex().length(24);

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
  counterNo: Joi.number().min(1).optional(),
}).options({ abortEarly: false, allowUnknown: false });
