import connectToDatabase from '@/lib/mongodb';
import { forgotPassword } from '@/lib/services/auth/forget-password';
import ResponseHandler from '@/lib/utils/responseUtil';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const messageId = await forgotPassword(req.body);

      if (messageId) {
        return ResponseHandler.sendSuccess(res, `Mail sent successfully`);
      } 
      else {
        return ResponseHandler.sendError(res, `Something went wrong`, 400);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return ResponseHandler.sendError(res, error.message, 400);
      }
      return ResponseHandler.sendError(
        res,
        'An unexpected error occurred',
        500,
      );
    }
  } else {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }
}

export default handler;
