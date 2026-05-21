import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { applyCors } from '@/lib/cors';
import { GeneralSettingModel } from '@/lib/models/GeneralSetting.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== 'GET')
    return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    let settings = await GeneralSettingModel.findOne().lean();

    if (!settings) {
      settings = await GeneralSettingModel.create({});
    }

    return ResponseHandler.sendSuccess(res, settings, 'General settings fetched');
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
