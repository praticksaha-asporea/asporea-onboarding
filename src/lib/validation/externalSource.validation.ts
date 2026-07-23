import Joi from 'joi';
import { passwordSchema } from './userValidation';

const phoneSchema = Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .messages({ 'string.pattern.base': 'Number must be exactly 10 digits' });


export const createExternalSourceSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).trim().required(),
    lastName: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    phoneNumber: phoneSchema.required(),
    whatsappNumber: phoneSchema.optional().allow('', null),
    address: Joi.string().trim().optional().allow('', null),
    role: Joi.string().valid('pca', 'pcra', 'institute').required(),
    subOf: Joi.string().hex().length(24).optional().allow('', null),


    password: passwordSchema.required(),

    notificationPreference: Joi.object({
        sms: Joi.boolean().optional(),
        whatsapp: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
    }).optional(),
}).options({ abortEarly: false, allowUnknown: false });


export const updateExternalSourceSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).trim().optional(),
    lastName: Joi.string().min(2).max(50).trim().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    phoneNumber: phoneSchema.optional(),
    whatsappNumber: phoneSchema.optional().allow('', null),
    address: Joi.string().trim().optional().allow('', null),
    role: Joi.string().valid('pca', 'pcra', 'institute').optional(),
    subOf: Joi.string().hex().length(24).optional().allow('', null),


    password: passwordSchema.optional().allow('', null),

    notificationPreference: Joi.object({
        sms: Joi.boolean().optional(),
        whatsapp: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
    }).optional(),
}).options({ abortEarly: false, allowUnknown: false });