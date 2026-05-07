import Joi from 'joi';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const roleSchema = Joi.string().valid(
  'admin', 'tac', 'user', 'reception', 'finance', 'coordinator',
  'pca', 'pcra', 'institute', 'sub_pca', 'branch_head', 'tac_head',
);

const phoneSchema = Joi.string()
  .trim()
  .pattern(/^[0-9]{10}$/)
  .messages({ 'string.pattern.base': 'Number must be exactly 10 digits' });

const objectIdSchema = Joi.string().hex().length(24);

const notificationPreferenceSchema = Joi.object({
  sms: Joi.boolean().optional(),
  whatsapp: Joi.boolean().optional(),
  email: Joi.boolean().optional(),
}).optional();

// ─── Create User ──────────────────────────────────────────────────────────────

export const createUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().required(),
  lastName: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().pattern(passwordRegex).optional().messages({
    'string.pattern.base':
      'Password must be 8+ chars with uppercase, lowercase, number & special char',
  }),
  phoneNumber: phoneSchema.optional(),
  whatsappNumber: phoneSchema.optional(),
  address: Joi.string().trim().optional(),
  role: roleSchema.required(),
  passportStatus: Joi.string().valid('having', 'not', 'applied').optional(),
  passportNo: Joi.string().trim().max(20).optional(),
  notificationPreference: notificationPreferenceSchema,
}).options({ abortEarly: false, allowUnknown: false });

// ─── Update User ──────────────────────────────────────────────────────────────

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().optional(),
  lastName: Joi.string().min(2).max(50).trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phoneNumber: phoneSchema.optional(),
  whatsappNumber: phoneSchema.optional(),
  address: Joi.string().trim().optional(),
  role: roleSchema.optional(),
  passportStatus: Joi.string().valid('having', 'not', 'applied').optional(),
  passportNo: Joi.string().trim().max(20).optional(),
  status: Joi.string().valid('active', 'inactive', 'deleted').optional(),
  reviewer: objectIdSchema.optional(),
  notificationPreference: notificationPreferenceSchema,
  id:Joi.string().trim().required(),
}).options({ abortEarly: false, allowUnknown: false });

// ─── Update Note ──────────────────────────────────────────────────────────────

export const updateNoteSchema = Joi.object({
  enquired: Joi.boolean().optional(),
  reviewer: objectIdSchema.optional(),
})
  .or('enquired', 'reviewer')
  .options({ abortEarly: false, allowUnknown: false });
