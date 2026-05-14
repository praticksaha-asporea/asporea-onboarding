import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { decodedToken, getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { updateUser } from '@/lib/services/admin/user.service';
import { updateUserSchema } from '@/lib/validation/userValidation';
import { applyCors } from '@/lib/cors';
import { JwtPayload } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();
    if (applyCors(req, res)) return;

    if (req.method !== 'PUT' && req.method !== 'PATCH')
        return ResponseHandler.sendError(res, 'Method not allowed', 405);

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError('Unauthenticated user', 401);
        // Any authenticated user can update their own profile
        const authUser = await verifyToken(token);
        let decodedJwt = decodedToken(token) as JwtPayload;
        if (decodedJwt?.userId !== req.body.id) throw new ApiError('You are not authorized to update another profile', 401);

        // User can only update their own profile — id comes from the token, not the body
        const userId = authUser.id;

        const { error, value } = updateUserSchema.validate(req.body);
        if (error) {
            const message = error.details.map((d) => d.message).join(', ');
            throw new ApiError(message, 400);
        }

        const updated = await updateUser(userId, value);
        return ResponseHandler.sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error: unknown) {
        if (error instanceof ApiError)
            return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
        return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
    }
}
