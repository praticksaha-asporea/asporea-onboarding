import { ApiError } from "../error/api.error";
import { IUser } from "../models/User.model";

export const authorizeRoles = (...roles: NonNullable<IUser['role']>[]) => {
  return (authUser: IUser) => {
    if (!authUser.role || !roles.includes(authUser.role)) {
      throw new ApiError('Access denied', 403);
    }
  };
};