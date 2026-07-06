import { ApiError } from "@/lib/error/api.error";
import { Otp } from "@/lib/models/Otp.model";
import User, { IUser } from "@/lib/models/User.model";
import "@/lib/models/Upload.model";
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

  const admin: IUser | null = await User.findOne({ email }).populate('profilePic', 'path');
  if (admin) {
    if (!(await comparePassword(password, admin.password as string))) {
      throw new ApiError('Invalid credentials', 401);
    }
    if (admin.role !== "admin") {
      throw new ApiError("Admin only allowed", 401)
    }
    const tokens = await generateTokens({
      _id: String(admin._id),
      role: "admin"
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
    userId: user._id,
    'otp.code': code,
  });

  if (!otpData) {
    throw new ApiError('Invalid Code');
  }


  if (otpData.otp.expiresAt < new Date()) {
    throw new ApiError('Code has been expired');
  }

  if (!user) {
    throw new ApiError('Invalid User');
  }

  const hashedPassword = await hashPassword(password);

  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  await Otp.deleteOne({ otp: otpData.otp });
};
