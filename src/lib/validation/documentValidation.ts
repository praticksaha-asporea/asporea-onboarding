import Joi from "joi";

export const createDocumentTypeSchema = Joi.object({
  title: Joi.string().trim().required(),
  section: Joi.string()
    .valid(
      "resume",
      "document",
      "experience",
      "academic",
      "additional"
    )
    .required(),
  subTitle: Joi.optional(),
  supportedExtensions: Joi.array()
    .items(Joi.string().trim())
    .optional(),
  required: Joi.boolean().default(false),
  multiple: Joi.boolean().default(false),
}).options({
  abortEarly: false,
  allowUnknown: false,
});



export const updateDocumentTypeSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().required(),
  section: Joi.string()
    .valid(
      "resume",
      "document",
      "experience",
      "academic",
      "additional"
    )
    .required(),
  subTitle: Joi.optional(),
  supportedExtensions: Joi.array()
    .items(Joi.string().trim())
    .optional(),
  required: Joi.boolean(),
  multiple: Joi.boolean(),
}).options({ abortEarly: false, allowUnknown: false });