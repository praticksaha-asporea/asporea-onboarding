import { Otp } from "../models/Otp.model";
import dayjs from 'dayjs';

export async function generateResetPasswordOTP(userId: string,sentTo:string) {
  const otp = await generateUniqueOtp();
  const otpExpires = dayjs().add(
    Number(process.env.PASSWORD_OTP_EXPIRES_MINUTES || 10),
    'minutes',
  );

  await saveOtp(userId, otp, otpExpires,sentTo);
  return otp;
}


async function generateUniqueOtp(): Promise<string> {
  let otp: string;
  let existingOtp: null;

  do {
    otp = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(
      '',
    );
    existingOtp = await Otp.findOne({ otp });
  } while (existingOtp);

  return otp;
}

async function saveOtp(
  userId: string,
  otp: string,
  expires: dayjs.Dayjs,
  sentTo:string
) {
  await Otp.findOneAndUpdate(
    { userId },
    {
      otp: {
        code: otp,
        expiresAt: expires.toDate(), 
        sentTo: sentTo
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    }
  );
}
