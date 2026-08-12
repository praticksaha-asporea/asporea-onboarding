import Joi from "joi";

const objectIdSchema = Joi.string().hex().length(24);

// Validates that every item in mandatoryDocuments also exists in requiredDocuments
function validateMandatorySubset(value: any, helpers: Joi.CustomHelpers) {
  const required: string[] = value.requiredDocuments ?? [];
  const mandatory: string[] = value.mandatoryDocuments ?? [];

  if (mandatory.length === 0) return value;

  const requiredSet = new Set(required);
  const invalid = mandatory.filter((id) => !requiredSet.has(id));

  if (invalid.length > 0) {
    return helpers.message({
      custom: "Mandatory documents must be within required documents",
    });
  }

  return value;
}

export const createPositionSchema = Joi.object({
  title: Joi.string().trim().required(),
  details: Joi.string().trim().optional(),
  requiredDocuments: Joi.array().items(objectIdSchema).optional(),
  mandatoryDocuments: Joi.array().items(objectIdSchema).optional(),
  positionBrochure: objectIdSchema.optional(),
  type: Joi.array().items(objectIdSchema).optional(),
  programTypes: Joi.array().items(objectIdSchema).optional(), 
  country: objectIdSchema.optional(),    
})
  .custom(validateMandatorySubset)
  .options({ abortEarly: false, allowUnknown: false });

export const updatePositionSchema = Joi.object({
  id: objectIdSchema.required(),
  title: Joi.string().trim().optional(),
  details: Joi.string().trim().optional(),
  requiredDocuments: Joi.array().items(objectIdSchema).optional(),
  mandatoryDocuments: Joi.array().items(objectIdSchema).optional(),
  positionBrochure: objectIdSchema.optional(),
  type: Joi.array().items(objectIdSchema).optional(),
  programTypes: Joi.array().items(objectIdSchema).optional(),
  country: objectIdSchema.optional(),
})
  .custom(validateMandatorySubset)
  .options({ abortEarly: false, allowUnknown: false });
