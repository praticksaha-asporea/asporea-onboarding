// import { NextApiRequest , NextApiResponse } from 'next';
// import connectToDatabase from '@/lib/mongodb';
// import { login } from '@/lib/services/auth/login';
// import ResponseHandler from '@/lib/utils/responseUtil';
// import { ApiError } from '@/lib/error/api.error';
// import { loginSchema } from '@/lib/validation/authValidation';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   await connectToDatabase();

//   if (req.method !== 'POST') {
//     return ResponseHandler.sendError(res, 'Method not allowed', 405);
//   }

//   try {
//     const {error} = loginSchema.validate(req.body,{
//       abortEarly:false,
//       allowUnknown:false,
//       stripUnknown:true,
//     });

//     if(error) {
//       const message = error.details.map((detail)=>detail.message).join(', ');
//       throw new ApiError(message,400);
//     }
//     const userData = await login(req.body);
//     return ResponseHandler.sendSuccess(
//       res,userData,'User Successfully Logged in ',
    
//     )
//   } catch (error: unknown){
//     if(error instanceof ApiError) {
//       return ResponseHandler.sendError(
//         res,error.message,error.statusCode,
//       )
//     }
//     return ResponseHandler.sendError(res,'Unknown error occurred',500);
//   }
// }


import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import { login } from "@/lib/services/auth/login";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { loginSchema } from "@/lib/validation/authValidation";

/* 🔹 Add this helper inline or import from lib */
const applyCors = (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // if using cookies later
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* ✅ CORS FIRST (before anything else) */
  if (applyCors(req, res)) return;

  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const { error } = loginSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      throw new ApiError(message, 400);
    }

    const userData = await login(req.body);

    return ResponseHandler.sendSuccess(
      res,
      userData,
      "User Successfully Logged in"
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode
      );
    }

    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}