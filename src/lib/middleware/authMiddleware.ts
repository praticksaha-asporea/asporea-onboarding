import { verifyAccessToken } from '@/lib/utils/tokenUtil';
import { ApiError } from '@/lib/error/api.error';

export const protect = (handler: any) => async (req: any, res: any) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) throw new ApiError('Unauthorized', 401);

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    return handler(req, res);
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};