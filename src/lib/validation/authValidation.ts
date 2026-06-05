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
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),
  address: Joi.string()
    .min(5)
    .trim()
    .required()
    .messages({
      "string.base": "Invalid address",
      "string.empty": "Address is required",
      "string.min": "Address must be at least 5 characters",
      "any.required": "Address is required",
    }),
  whatsappNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "WhatsApp number must be exactly 10 digits",
    }),
  passportStatus: Joi.string()
    .valid("having", "not", "applied")
    .required()
    .messages({
      "any.only":
        "Passport status must be one of: having, not, applied",
      "string.empty": "Passport status is required",
      "any.required": "Passport status is required",
    }),

  passportNumber: Joi.string()
    .trim()
    .max(20)
    .when("passportStatus", {
      is: "having",

      then: Joi.string()
        .trim()
        .required()
        .messages({
          "string.empty":
            "Passport number is required when passport status is having",

          "any.required":
            "Passport number is required when passport status is having",

          "string.max":
            "Passport number cannot exceed 20 characters",
        }),

      otherwise: Joi.string().allow("", null).optional(),
    }),
  social: Joi.object({
    providerId: Joi.string().trim().required(),
    scopes: Joi.string().trim().optional(),
    accessToken: Joi.string().trim().optional(),
    expiresAt: Joi.string().trim().optional(),
    type: Joi.string().trim().required(),
  }).optional(),
}).options({ abortEarly: false, allowUnknown: false });

export const loginSchema = Joi.object({
  identity: Joi.alternatives()
    .try(
      Joi.string().email().lowercase().trim().messages({ "string.email": "Invalid email format" }),
      Joi.string().pattern(/^[0-9]{10}$/).messages({ "string.pattern.base": "Phone number must be exactly 10 digits" }),
    )
    .required()
    .messages({ "alternatives.match": "Must be a valid email or 10-digit phone number" }),
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

export const guestTokenSchema = Joi.object({
  identity: Joi.string().trim().required()
}).options({ abortEarly: false, allowUnknown: false });

export const adminLoginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
}).options({ abortEarly: false, allowUnknown: false });

export const adminForgotPasswordSchema = Joi.object({
  email: emailSchema,
}).options({ abortEarly: false, allowUnknown: false });

export const adminResetPasswordSchema = Joi.object({
  email: emailSchema,
  code: Joi.string().trim().required().messages({
    "string.empty": "Reset code is required",
  }),
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
    }),
}).options({ abortEarly: false, allowUnknown: false });

export const adminChangePasswordSchema = Joi.object({
  userId: Joi.string().optional(),
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old password is required",
  }),
  newPassword: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
    }),
}).options({ abortEarly: false, allowUnknown: false });