import { NextApiRequest, NextApiResponse } from 'next';
import ResponseHandler from '../../../../lib/utils/responseUtil';
import connectToDatabase from '../../../../lib/mongodb';
import { ApiError } from '../../../../lib/error/api.error';
import { getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { applyCors } from '@/lib/cors';
import UserModel from '@/lib/models/User.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== 'GET')
    return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError('Unauthenticated user', 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== 'admin') throw new ApiError('User must be an admin', 403);

    const roles = await UserModel.distinct('role');

    const data = roles;

    return ResponseHandler.sendSuccess(res, data, 'Roles fetched');
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);

    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
