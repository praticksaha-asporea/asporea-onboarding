import User from '@/lib/models/User.model';
import { RegisterPayload } from '@/Types/Backend_Payload/auth.types';
import { Upload } from '@/lib/models/Upload.model';
import { hashPassword } from '@/lib/utils/bcryptUtil';
import { ApiError } from '@/lib/error/api.error';
import { SocialLogins } from '@/lib/models/SocialLogins.model';

export const register = async (body: RegisterPayload & { profilePicData?: string }) => {

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    whatsappNumber,
    passportStatus,
    passportNo,
    password,
    address,
    social,
    profilePicData
  } = body;

  const existingUser = await User.findOne({ email });
  const existingPhone = await User.findOne({ phoneNumber: phoneNumber });
  const existingWhatsapp = await User.findOne({ whatsappNumber: whatsappNumber });


  if (existingUser) {
    throw new ApiError('This Email Already exists', 400);
  }
  else if (existingPhone) {
    throw new ApiError('This Phone Already exists', 400);
  }
  else if (existingWhatsapp) {
    throw new ApiError('This Whatsapp Already exists', 400);
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
    whatsappNumber,
    passportStatus,
    passportNo,
    address,
    role: "user"
  });
if (profilePicData) {
    let finalImagePath = "";

    if (profilePicData.startsWith("http")) {
     
      finalImagePath = profilePicData;
    } else if (profilePicData.startsWith("data:image")) {
       
      finalImagePath = profilePicData; 
    } else {
      
      finalImagePath = profilePicData;
    }

    if (finalImagePath) {
      const uploadDoc = await Upload.create({
        userId: newUser._id,
        path: finalImagePath  
      });

      newUser.profilePic = uploadDoc._id;
      await newUser.save();
    }
  }
  if (social) {
    await SocialLogins.create({
      userId: newUser?._id,
      type: social?.type,
      providerId: social?.providerId,
      accessToken: social?.accessToken,
      scopes: social?.scopes,
      expiresAt: social?.expiresAt
    })
  }
  return { newUser }
};