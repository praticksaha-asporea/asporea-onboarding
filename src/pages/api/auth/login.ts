import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import { login } from '@/lib/services/auth/login';
import ResponseHandler from '@/lib/utils/responseUtil';
import { ApiError } from '@/lib/error/api.error';
import { loginSchema } from '@/lib/validation/authValidation';
import { applyCors } from '@/lib/cors'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;
  await connectToDatabase();

  if (req.method !== 'POST') {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }

  try {
    const { error } = loginSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new ApiError(message, 400);
    }
    const userData = await login(req.body);    
    return ResponseHandler.sendSuccess(
      res, 
      userData, 
      'User Successfully Logged in'
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    // console.error("Login Error:", error); 
    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}