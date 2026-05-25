import User, { IUser } from '@/lib/models/User.model';
import { generateTokens } from '@/lib/utils/tokenUtil';
import { comparePassword } from '@/lib/utils/bcryptUtil';
import { ApiError } from '@/lib/error/api.error';

interface LoginBody {
  identity: string;
  password: string;
}

export const login = async (body: LoginBody) => {
  const { identity, password } = body;

  const isPhone = /^[0-9]{10}$/.test(identity);

  const user: IUser | null = await User.findOne(
    isPhone
      ? { phoneNumber: identity }
      : { email: identity.toLowerCase().trim() },
  ).select('+password');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!user.password) {
    throw new ApiError('Password not set', 400);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError('Incorrect password', 401);
  }

  if (user.role === 'admin') {
    throw new ApiError('Please login on admin portal', 401);
  }

  const tokens = await generateTokens({
    _id: String(user._id),
    role: String(user.role),
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      role: user.role,
      bio:user.bio,
      experienceInMonths: user.experienceInMonths,
    },
    tokens,
  };
};
