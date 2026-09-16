import Joi from "joi";

export const createEscalationSchema = Joi.object({
    fromId: Joi.string()
        .hex()
        .length(24)
        .required(),
    leadId: Joi.string()
        .hex()
        .length(24)
        .required(),
    status: Joi.string()
        .valid("requested", "actionTaken")
        .default("requested"),
    reason: Joi.string()
        .required()
});