import { ApiError } from "@/lib/error/api.error";
import { Otp } from "@/lib/models/Otp.model";
import User, { IUser } from "@/lib/models/User.model";
import { comparePassword, hashPassword } from "@/lib/utils/bcryptUtil";
import { generateTokens } from "@/lib/utils/tokenUtil";
import { ResetPasswordPayload } from "@/Types/Backend_Payload/auth.types";

interface AdminLoginInput {
  email: string;
  password: string;
  role: string;
}

export const adminLoginService = async (body: AdminLoginInput) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new ApiError('Email, password are required', 400);
  }

  const admin: IUser | null = await User.findOne({ email });
  if (admin) {
    if (!(await comparePassword(password, admin.password as string))) {
      throw new ApiError('Invalid credentials', 401);
    }
    const tokens = await generateTokens({
      _id: String(admin._id)
    });

    return {
      admin,
      tokens,
    };
  }

  throw new ApiError('Invalid Credentials', 403);

};


export const resetAdminPassword = async (payload: ResetPasswordPayload) => {
  const { code, email, password, confirmPassword } = payload;
  // console.log(code, email, password, confirmPassword);
  if (!code || !email || !password) {
    throw new ApiError('Code, email and password are required');
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
      400
    );
  }
  if (password !== confirmPassword) {
    throw new ApiError('Passwords do not match');
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError('Admin not found', 403);
  }


  const otpData = await Otp.findOne({
  userId: user._id, // OR email if you store it
  'otp.code': code,
  'otp.expiresAt': { $gt: new Date() },
});

  if (!otpData) {
    throw new ApiError('Invalid Code');
  }

  // this is not working need to work
  if (otpData.expiresAt < new Date()) {
    throw new ApiError('Code has been expired');
  }

  // Check user is exist or not
  if (!user) {
    throw new ApiError('Invalid User');
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update user record with new password
  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  // Delete reset password OTP
  await Otp.deleteOne({ otp: otpData.otp });
};
