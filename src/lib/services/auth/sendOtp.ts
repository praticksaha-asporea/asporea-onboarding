import { Otp } from "@/lib/models/Otp.model";
import User from "@/lib/models/User.model";
import { sendMail } from "@/lib/utils/emailUtil";
import { sendSms, sendWhatsApp } from "@/lib/utils/messageUtil";

const EMAIL_CHANNEL = "email" as const;
const SMS_CHANNEL = "sms" as const;
const WHATSAPP_CHANNEL = "whatsapp" as const;

type DeliveryChannel = typeof EMAIL_CHANNEL | typeof SMS_CHANNEL | typeof WHATSAPP_CHANNEL;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Resolve delivery channel and destination purely from the identity string,
 *  without needing a DB user record. */
function resolveChannelFromIdentity(
  normalizedIdentity: string,
): { channel: DeliveryChannel; destination: string } {
  if (isEmail(normalizedIdentity)) {
    return { channel: EMAIL_CHANNEL, destination: normalizedIdentity };
  }
  // Treat anything that looks like a phone number as WhatsApp-first, SMS fallback.
  // Callers can extend this logic if they need to distinguish the two.
  return { channel: WHATSAPP_CHANNEL, destination: normalizedIdentity };
}

export const sendOtpService = async (identity: string) => {
  const normalizedIdentity = identity.trim();

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentity },
      { phoneNumber: normalizedIdentity },
      { whatsappNumber: normalizedIdentity },
    ],
  }).select("email phoneNumber whatsappNumber");

  let channel: DeliveryChannel;
  let destination: string;

  if (user) {
    // ── Registered user: prefer the field that matched the identity ──────────
    if (user.email === normalizedIdentity) {
      channel = EMAIL_CHANNEL;
      destination = user.email;
    } else if (user.whatsappNumber === normalizedIdentity) {
      channel = WHATSAPP_CHANNEL;
      destination = user.whatsappNumber as string;
    } else if (user.phoneNumber === normalizedIdentity) {
      channel = SMS_CHANNEL;
      destination = user.phoneNumber as string;
    } else if (isEmail(normalizedIdentity) && user.email) {
      channel = EMAIL_CHANNEL;
      destination = user.email;
    } else if (user.whatsappNumber) {
      channel = WHATSAPP_CHANNEL;
      destination = user.whatsappNumber;
    } else if (user.phoneNumber) {
      channel = SMS_CHANNEL;
      destination = user.phoneNumber;
    } else {
      throw new Error("No valid delivery channel found for this user");
    }
  } else {
    // ── Guest / unregistered: send directly to the provided identity ─────────
    ({ channel, destination } = resolveChannelFromIdentity(normalizedIdentity));
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(
    Date.now() +
      parseInt(process.env.LOGIN_OTP_EXPIRES_MINUTES || "10", 10) *
        60 *
        1000,
  );

  const message = `Your verification code is ${otpCode}. It expires in ${
    process.env.LOGIN_OTP_EXPIRES_MINUTES || "10"
  } minutes.`;

  if (channel === EMAIL_CHANNEL) {
    await sendMail({
      to: destination,
      subject: "Your login OTP code",
      html: `<div style="font-family: sans-serif; line-height: 1.4;">
        <p>Use the OTP below to complete your login:</p>
        <h2 style="margin: 0;">${otpCode}</h2>
        <p>This code will expire in ${
          process.env.LOGIN_OTP_EXPIRES_MINUTES || "10"
        } minutes.</p>
      </div>`,
    });
  } else if (channel === SMS_CHANNEL) {
    await sendSms({
      to: destination,
      body: message,
    });
  } else if (channel === WHATSAPP_CHANNEL) {
    await sendWhatsApp({
      to: destination,
      body: message,
    });
  }

  // Registered user: upsert by userId. Guest: upsert by sentTo (sparse unique on userId allows multiple null docs).
  if (user) {
    await Otp.findOneAndUpdate(
      { userId: user._id },
      {
        otp: {
          code: otpCode,
          expiresAt,
          sentTo: destination,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  } else {
    await Otp.findOneAndUpdate(
      { "otp.sentTo": destination, userId: { $exists: false } },
      {
        otp: {
          code: otpCode,
          expiresAt,
          sentTo: destination,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  }

  return {
    channel,
    sentTo: destination,
    expiresAt,
    isRegistered: !!user,
  };
};