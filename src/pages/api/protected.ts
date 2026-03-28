import { protect } from '@/lib/middleware/authMiddleware';
import ResponseHandler from '@/lib/utils/responseUtil';

async function handler(req: any, res: any) {
  return ResponseHandler.sendSuccess(res, {
    message: 'Protected route accessed',
    user: req.user,
  });
}

export default protect(handler);