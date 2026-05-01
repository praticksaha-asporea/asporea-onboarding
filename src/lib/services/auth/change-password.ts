// register.service.ts
import UserModel from '../../models/User.model';
import { comparePassword, hashPassword } from '../../utils/bcryptUtil';
import { ApiError } from '../../error/api.error';
import { changePasswordPayload } from '@/Types/Backend_Payload/auth.types';

export const changePassword = async (payload: changePasswordPayload) => {
  const { userId, newPassword, oldPassword, confirmPassword } = payload;

  if (!userId) {
    throw new ApiError('User id is not provided ', 400);
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError('All password fields are required ', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError('Passwords do not match', 400);
  }

  // Find user and include password
  const user = await UserModel.findById(userId).select('+password');
  // console.log(payload,9877);
  
  if (!user || !user.password) {
    throw new ApiError('User not found or password not set', 400);
  }
  if (
    user.status !== 'active'
  ) {
    throw new ApiError('User is not active.', 403);
  }

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError('Old password is incorrect', 403);
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();
  
  return {
    id: user._id,
    firstName: user.firstName,
    lastname: user.lastName,
    email: user.email,
    updatedAt: user.updatedAt,
  };
};
