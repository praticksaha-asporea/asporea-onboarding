import jwt from "jsonwebtoken";
import Token from "../models/Token.model";
const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN!;
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN!;
import ms from 'ms';

export const generateTokens = async(user: any) => {
  const accessToken = jwt.sign({ userId: user._id,role:user.role }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });

  const refreshToken = jwt.sign({ userId: user._id,role:user.role }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });

   await Token.create({
    userId:user._id,
    role: user.role,
    token:refreshToken,                      
    type:'refresh',
    expiresAt: new Date(Date.now() + ms(REFRESH_EXPIRES_IN as ms.StringValue)),    // i am using ms package to convert it into milliseconds  for db storage
   });
   return { accessToken,refreshToken}
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET);
};
