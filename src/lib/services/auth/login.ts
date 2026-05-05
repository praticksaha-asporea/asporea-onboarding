import User,{IUser} from '@/lib/models/User.model';
import { generateTokens } from '@/lib/utils/tokenUtil';
import { comparePassword } from '@/lib/utils/bcryptUtil';
import { ApiError } from '@/lib/error/api.error';

interface LoginBody {
  email:string;
  password:string;
}
export const login = async (body:LoginBody ) => {
  const { email, password } = body;

  const user: IUser | null = await User.findOne({ email }).select("+password") ;
  console.log(user,5844);
  
   if(!user){
    throw new ApiError("User not found Please Type Correct Email",404)
   }

   if(!user.password) {
    throw new ApiError('Password not set',400);
   }

   const isMatch = await comparePassword(password,user.password);

   if(!isMatch) {
    throw new ApiError("Incorrect Password",401)
   }

   const tokens = await generateTokens({
    _id: String(user._id),
    role: String(user.role)
   });

   return {
    user:{
      id:user._id,
      email:user.email,
    },  
    tokens
   }
};