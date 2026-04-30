import { ApiError } from "@/lib/error/api.error";
import User from "@/lib/models/User.model";
import { sendMail } from "@/lib/utils/emailUtil";
import { generateResetPasswordOTP } from "@/lib/utils/otpUtils";
import { ForgotPasswordPayload } from "@/Types/Backend_Payload/auth.types";

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const { email } = payload;
  const identifier = email?.trim();

  if (!identifier) {
    throw new ApiError("Email/Phone is required", 400);
  }
  const userData = await User.findOne({ email: identifier }).select(
    'firstName lastName email phoneNumber whatsappNumber password'
  );

  // const userData = await User.findOne({
  //     $or: [
  //         { email: identifier },
  //         { phoneNumber: identifier },
  //         { whatsappNumber: identifier },
  //     ],
  // }).select(
  //     'firstName lastName email phoneNumber whatsappNumber password'
  // );

  // Check if user is not exist
  if (!userData) {
    throw new ApiError('Invalid user', 401);
  }

  // Generate reset password OTP
  const otp = await generateResetPasswordOTP(userData?._id.toString(), userData.email);

  const mailData = {
    to: userData.email,
    subject: 'Forgot Password',
    template: 'forgot-password',
    contextData: {
      fullName: `${userData.firstName} ${userData.lastName}`,
      otp,
    },
    html: `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>Forgot Password</title>
    <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f8fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .content {
      padding: 20px 0;
      color: #333;
    }
    .otp {
      display: inline-block;
      font-size: 24px;
      font-weight: bold;
      background-color: #f1f1f1;
      padding: 10px 20px;
      border-radius: 6px;
      letter-spacing: 2px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    </style>
    </head>
    <body>
    <div class="container">
    <div class="header">
      <h2>Forgot Password Request</h2>
    </div>
    <div class="content">
      <p>Hi ${userData.firstName} ${userData.lastName},</p>
      <p>We received a request to reset your password. Use the OTP below to proceed:</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for the next 10 minutes.</p>
      <p>If you did not request this, please ignore this email or contact support.</p>
    </div>

    </div>
    </body>
    </html>
    `,
  };

  // Send email with reset password link
  const messageId = await sendMail(mailData);

  return messageId;
};