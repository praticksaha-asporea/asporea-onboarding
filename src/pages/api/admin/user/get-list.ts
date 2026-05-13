import { NextApiRequest, NextApiResponse } from 'next';
import ResponseHandler from '../../../../lib/utils/responseUtil';
import connectToDatabase from '../../../../lib/mongodb';

import { ApiError } from '../../../../lib/error/api.error';
import { userList } from '@/lib/services/admin/user.service';
import { getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { applyCors } from '@/lib/cors';

// type UserRole = 'instructor' | 'learner' | 'admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }

  try {

        const token = getTokenFromHeader(req);
    
        if (token === null) {
          throw new ApiError('Un-aunthentic user ', 401);
        }
    
        const authUser = await verifyToken(token);
        
        if (authUser.role!="admin") throw new ApiError('User must be an admin ', 401);
        
    /* ── Extract and validate query params ─────────────────────────── */
    const roleParam = Array.isArray(req.query.role)
      ? req.query.role[0]
      : req.query.role;

    
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    if (isNaN(page) || page <= 0) {
      return ResponseHandler.sendError(res, 'Invalid page number', 400);
    }
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return ResponseHandler.sendError(res, 'Invalid limit (max 100)', 400);
    }

    /* ── Fetch user list with pagination ───────────────────────────── */
    const keyword =
      typeof req.query.keyword === 'string' ? req.query.keyword : undefined;

    const data = await userList({
      role: roleParam as "admin" | "tac" | "user" | "reception" | "finance" | "coordinator" | "pca" | "pcra" | "institute" | "sub_pca" | "branch_head" | "tac_head" | undefined,
      keyword,
      page,
      limit,
    });

    return ResponseHandler.sendSuccess(res, data, 'User list fetched');
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    }

    console.error('Error fetching user list:', error);
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
