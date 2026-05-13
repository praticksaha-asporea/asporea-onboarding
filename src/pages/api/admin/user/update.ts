import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { updateUser } from '@/lib/services/admin/user.service';
import { updateUserSchema } from '@/lib/validation/userValidation';
import { applyCors } from '@/lib/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== 'PUT' && req.method !== 'PATCH')
    return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError('Unauthenticated user', 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== 'admin') throw new ApiError('Admin access required', 403);

    const userId = req.body.id as string;
    // if (!userId) throw new ApiError('User ID is required', 400);
    
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      throw new ApiError(message, 400);
    }

    const updated = await updateUser(userId, req.body);
    
    return ResponseHandler.sendSuccess(res, updated, 'User updated successfully');
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
