import Joi from "joi";

export const addTechnicalResultSchema = Joi.object({
  leadId: Joi.string().required(),
  assessmentId: Joi.string().optional(),
  achievedScore: Joi.number().required(),
  totalScore: Joi.number().required(),
  questions: Joi.number().required(),
  answered: Joi.number().required(),
  timeTaken: Joi.string().required(),
  type: Joi.string().required(),
  feedback: Joi.string().optional()
});