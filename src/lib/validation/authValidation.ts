import Joi from "joi";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .max(100)
  .required()
  .messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  });

const nameSchema = Joi.string()
  .min(2)
  .max(50)
  .trim()
  .pattern(/^[a-zA-Z\s]+$/)
  .required()
  .messages({
    "string.pattern.base": "Name should contain only letters",
  });

const passwordSchema = Joi.string().pattern(passwordRegex).required().messages({
  "string.pattern.base":
    "Password must be 8+ chars with uppercase, lowercase, number & special char",
});

export const registerSchema = Joi.object({ 
  firstName: nameSchema,
   lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,

  role: Joi.string().valid("user", "admin").optional(),
})
  .options({ abortEarly: false })
  .unknown(false);

export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
})
  .options({ abortEarly: false })
  .unknown(false);

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const phoneLoginSchema = Joi.object({
  identity: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
  identity: Joi.string().trim().required(),
  otp: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "OTP must be a 6-digit number",
    }),
}).options({ abortEarly: false, allowUnknown: false });