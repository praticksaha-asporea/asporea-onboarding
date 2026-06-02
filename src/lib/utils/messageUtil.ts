export type MessageChannel = "sms" | "whatsapp";

export async function sendSms({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  // Placeholder SMS sender.
  // Replace with a real provider integration when ready.
  return {
    success: true,
    channel: "sms",
    to,
  };
}

export async function sendWhatsApp({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  // Placeholder WhatsApp sender.
  // Replace with a real provider integration when ready.
  return {
    success: true,
    channel: "whatsapp",
    to,
  };
}
