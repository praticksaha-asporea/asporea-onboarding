import connectToDatabase from '@/lib/mongodb';
import { forgotPassword } from '@/lib/services/auth/forget-password';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { adminForgotPasswordSchema } from '@/lib/validation/authValidation';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }

  try {
    const { error } = adminForgotPasswordSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new ApiError(message, 400);
    }

    const messageId = await forgotPassword(req.body);

    if (messageId) {
      return ResponseHandler.sendSuccess(res, `Mail sent successfully`);
    } else {
      return ResponseHandler.sendError(res, `Something went wrong`, 400);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    return ResponseHandler.sendError(res, 'An unexpected error occurred', 500);
  }
}

export default handler;
