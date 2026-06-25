import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { applyCors } from '@/lib/cors';
import { GeneralSettingModel } from '@/lib/models/GeneralSetting.model';
import Joi from 'joi';

const updateGeneralSettingsSchema = Joi.object({
  escalationTimelineHours:    Joi.number().min(1).optional().messages({
    "number.base": "Escalation Timeline must be a number",
    "number.min": "Escalation Timeline must be minimum 1 Hour",
  }),
  inqResTimelineHours:        Joi.number().min(1).optional().messages({
    "number.base": "Inquiry Response Timeline must be a number",
    "number.min": "Inquiry Response Timeline must be minimum 1 Hour",
  }),
  preCounsellingTimelineHours: Joi.number().min(1).optional().messages({
    "number.base": "Pre Counselling Timeline must be a number",
    "number.min": "Pre Counselling Timeline must be minimum 1 Hour",
  }),
  assessmentTimelineHours:    Joi.number().min(1).optional().messages({
    "number.base": "Assessment Timeline must be a number",
    "number.min": "Assessment Timeline must be minimum 1 Hour",
  }),
  tacAssignmentType:          Joi.string().valid('random', 'counterwise').optional(),
  inquiryNumberFormat:        Joi.string().trim().optional(),
  lastFy:                     Joi.string().trim().optional(),
  assessment: Joi.object({
    fullMarks: Joi.number().min(0).optional().messages({ "number.base": "Full marks must be a number" }),
    passingMarks: Joi.number().min(0).optional().messages({ "number.base": "Passing marks must be a number" })
  }).optional(),

  technical: Joi.object({
    fullMarks: Joi.number().min(0).optional().messages({ "number.base": "Full marks must be a number" }),
    passingMarks: Joi.number().min(0).optional().messages({ "number.base": "Passing marks must be a number" })
  }).optional()
  // lastCounter:             Joi.string().trim().optional(),
  // lastInq is system-managed — not updatable via this endpoint
}).options({ abortEarly: false, allowUnknown: false });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== 'PATCH' && req.method !== 'PUT')
    return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError('Unauthenticated user', 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== 'admin') throw new ApiError('Admin access required', 403);

    const { error, value } = updateGeneralSettingsSchema.validate(req.body);
    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(', '), 400);

    const updated = await GeneralSettingModel.findOneAndUpdate(
      {},
      { $set: value },
      { returnDocument: 'after', upsert: true, runValidators: true },
    ).lean();

    return ResponseHandler.sendSuccess(res, updated, 'General settings updated');
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
