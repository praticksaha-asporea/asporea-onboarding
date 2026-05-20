import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { getExternalSourcesByType } from '@/lib/services/Inquiry/inquiry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (req.method !== 'GET') return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError('Unauthenticated user', 401);
    await verifyToken(token);

    const type = req.query.type as string;
    if (!type) throw new ApiError('Source type parameter is missing', 400);
    
    const data = await getExternalSourcesByType(type);
    return ResponseHandler.sendSuccess(res, data, 'External sources fetched successfully');
  } catch (error: unknown) {
    if (error instanceof ApiError) return ResponseHandler.sendError(res, error.message, error.statusCode);
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}