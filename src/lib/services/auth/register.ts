import User from '@/lib/models/User.model';
import { RegisterPayload } from '@/Types/Backend_Payload/auth.types';
import { Upload } from '@/lib/models/Upload.model';
import { hashPassword } from '@/lib/utils/bcryptUtil';
import { ApiError } from '@/lib/error/api.error';
import { SocialLogins } from '@/lib/models/SocialLogins.model';
import { uploadFileService } from '../upload.service';

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
      // console.log(222);
      if (profilePicData.includes('google') || profilePicData.includes('fbcdn')) {
        // Download image
        const response = await fetch(profilePicData);

        if (!response.ok) {
          throw new Error("Failed to download profile image");
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension =
          response.headers.get("content-type")?.split("/")[1] || "jpg";

        const file = {
          originalFilename: `profile${profilePicData}.${extension}`,
          mimetype: response.headers.get("content-type") || "image/jpeg",
          buffer,
          size: buffer.length,
        };
        console.log(file, 555);


        const uploadResult: any = await uploadFileService({
          file,
          userId: newUser?._id as any
        });
        console.log(uploadResult, 3333);

        newUser.profilePic = uploadResult.uploadId;
        await newUser.save();
      }
      else {
        finalImagePath = profilePicData;
      }
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