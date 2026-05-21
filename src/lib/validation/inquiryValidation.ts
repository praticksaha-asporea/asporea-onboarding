import Joi from "joi";

const objectIdSchema = Joi.string().hex().length(24);

export const createInquirySchema = Joi.object({
  fullName: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  whatsappNumber: Joi.string().trim().optional().allow("", null),
  prefferedBranch: objectIdSchema.required(),
  prefferedConsultant: objectIdSchema.optional().allow(null, ""),
  visitOption: Joi.number().valid(0, 1, 2).required(),
  fullAddress: Joi.string().trim().required(),
  referedFrom: Joi.string()
    .valid("web-app", "call", "social", "reffer")
    .required(),
  referedType: Joi.string()
    .valid("pca", "pcra", "institution", "other")
    .optional()
    .allow("", null),
  referedBy: Joi.string().trim().optional().allow("", null),
  otherReferedBy: Joi.string().trim().optional().allow(null, ""),
}).options({ abortEarly: false, allowUnknown: false });
