import Joi, { ValidationErrorItem } from "joi";

export const updateLeadSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  followUpRequired: Joi.boolean().optional(),
  fullName: Joi.string().trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    "string.pattern.base": "Phone must be exactly 10 digits",
  }),
  whatsapp: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    "string.pattern.base": "WhatsApp must be exactly 10 digits",
  }),
  address: Joi.string().trim().optional(),
  passportStatus: Joi.string().valid("having", "applied", "no").optional(),
  passportNo: Joi.string().trim().max(20).when("passportStatus", {
    is: "having",
    then: Joi.required().messages({ "any.required": "Passport number is required when status is Having" }),
    otherwise: Joi.optional().allow("", null),
  }),
  inqForType: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  inqForPosition: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  nationality: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  latestAcademic: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  latestTechnical: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  workExperience: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
}).options({ abortEarly: false, allowUnknown: false });