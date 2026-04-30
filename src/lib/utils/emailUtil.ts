import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
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
};

export async function sendMail({ to, subject, html }: SendMailParams) {
  const response = await transporter.sendMail({
    from: `"Asporea HR" <${process.env.FROM}>`,
    to,
    subject,
    html,
  });

  return response.messageId;
}