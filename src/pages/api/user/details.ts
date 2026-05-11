import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { viewUser } from '@/lib/services/admin/user.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'GET')
    return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    // const token = getTokenFromHeader(req);
    // if (!token) throw new ApiError('Unauthenticated user', 401);
    // const authUser = await verifyToken(token);

    // authorizeRoles('user')(authUser as any);

    const userId = req.query.id as string;
    if (!userId) throw new ApiError('User ID is required', 400);

    const data = await viewUser(userId);
    return ResponseHandler.sendSuccess(res, data, 'User fetched successfully');
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
