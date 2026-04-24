import User from '@/lib/models/User.model';
import { RegisterPayload } from '@/Types/Backend_Payload/auth.types';
import { hashPassword } from '@/lib/utils/bcryptUtil';
import { ApiError } from '@/lib/error/api.error';

export const register = async (body: RegisterPayload) => {
   
const {
  firstName,
  lastName,
  email,
  password
} = body; 

const existingUser = await User.findOne({email});

if(existingUser) {
  throw new ApiError('This Email Already exists',400);
}

const hashedPassword = await hashPassword(password);
const newUser = await User.create({
  firstName,
  lastName,
  email,
  password:hashedPassword
})

return { newUser }
};