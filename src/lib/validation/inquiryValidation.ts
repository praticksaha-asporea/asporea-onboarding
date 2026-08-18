import Joi from "joi";

const objectIdSchema = Joi.string().hex().length(24);

export const createInquirySchema = Joi.object({
  fullName: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  whatsappNumber: Joi.string().trim().optional().allow("", null),
  inquiryCategory: Joi.string().trim().required(),
  inquiryFor: Joi.string().trim().required(),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
}).options({ abortEarly: false, allowUnknown: false });


export const updateInquirySchema = Joi.object({
  // fullName: Joi.string().trim().required(),
  // email: Joi.string().email().lowercase().trim().required(),
  // phoneNumber: Joi.string().trim().required(),
  // whatsappNumber: Joi.string().trim().optional().allow("", null),
  // inquiryCategory: Joi.string().trim().required(),
  // inquiryFor: Joi.string().trim().required(),
  // latitude: Joi.string().optional(),
  // longitude: Joi.string().optional(),
  nationality: Joi.string().required(),
  latestAcademic: Joi.string().required(),
  latestTechnical: Joi.string().optional().allow(null, ""),
  workExperience: Joi.string().optional().allow(null, ""),
  referedFrom: Joi.string()
    .valid("web-app", "call", "social", "reffer")
    .required(),
  referedType: Joi.string()
    .valid("pca", "pcra", "institution", "other")
    .optional()
    .allow("", null),
  referedBy: Joi.string().trim().optional().allow("", null),
  otherReferedBy: Joi.string().trim().optional().allow(null, ""),
  id: Joi.string().required(),
}).options({ abortEarly: false, allowUnknown: false });
