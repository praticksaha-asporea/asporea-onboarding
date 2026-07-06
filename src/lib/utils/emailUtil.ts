import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SES_HOST,
  port: Number(process.env.SES_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

type SendMailParams = {
  to: string;
  subject: string;
  template?: string;
  contextData?: Record<string, unknown>;
  html?: string;
  fromName?: string;  
  replyTo?: string;   
};

export async function sendMail({ to, subject, html, fromName, replyTo }: SendMailParams) {
  const displayName = fromName ? `${fromName} - Asporea HR` : "Asporea HR";
  const response = await transporter.sendMail({
   from: `"${displayName}" <${process.env.FROM}>`,
   replyTo: replyTo || process.env.FROM,
    to,
    subject,
    html,
  });

  return response.messageId;
}