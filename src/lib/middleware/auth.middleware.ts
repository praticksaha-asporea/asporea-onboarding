import type { NextApiRequest } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../error/api.error';

export type UserRole = 'tac' | 'admin';
export interface AuthUser {
  id: string;
  role: UserRole;
}

export const getTokenFromHeader = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
  }
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  if (typeof req.query.token === 'string') return req.query.token;

  return null;
};

export const decodedToken= (token: string) => {
  return jwt.decode(token);
}

export const verifyToken = (token: string | null): Promise<AuthUser> =>
  new Promise((resolve, reject) => {
    if (!token)
      return reject(
        new ApiError(
          'Auth token missing or please login again or create an account first',
          401,
        ),
      );

    const secret = process.env.JWT_SECRET;
    if (!secret) return reject(new ApiError('JWT secret not set', 500));

    jwt.verify(token, secret, (err, decoded) => {
      if (err || !decoded || typeof decoded === 'string') {
        return reject(
          new ApiError('Invalid / expired token', 401, {
            isTokenValid: false,
          }),
        );
      }

      const { sub, role, userId } = decoded as JwtPayload & {
        sub?: string;
        userId?: string;
        role?: UserRole;
      };
      

      const id = sub || userId;
      if (!id || !role) {
        return reject(new ApiError('Token missing subject or role', 401));
      }

      resolve({ id, role });
    });
  });
