import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const transporter = nodemailer.createTransport({
  host: process.env.SES_HOST,
  port: Number(process.env.SES_PORT),
  secure: true,  
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
  attachments?: nodemailer.SendMailOptions["attachments"];
  attachBrochures?: boolean;
};

 
const getBrochureAttachments = () => {
  try {
    const brochureDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "Brochures",
    );

    if (!fs.existsSync(brochureDir)) {
      console.warn(`Brochure directory does not exist at: ${brochureDir}`);
      return [];
    }

    const files = fs.readdirSync(brochureDir);

    return files
      .filter((file) => !file.startsWith("."))
      .map((file) => ({
        filename: file,
        path: path.join(brochureDir, file),
      }));
  } catch (error) {
    console.error("Error reading brochure attachments:", error);
    return [];
  }
};

export async function sendMail({
  to,
  subject,
  html,
  fromName,
  replyTo,
  attachments = [],
  attachBrochures = false,
}: SendMailParams) {
  const displayName = fromName ? `${fromName} - Asporea HR` : "Asporea HR";

  let finalAttachments = [...(attachments || [])];

  //  if attachBrochures flag is true, then automatically attach all files from public/uploads/Brochures
  if (attachBrochures) {
    const brochureFiles = getBrochureAttachments();
    finalAttachments = [...finalAttachments, ...brochureFiles];
  }

  const response = await transporter.sendMail({
    from: `"${displayName}" <${process.env.FROM}>`,
    replyTo: replyTo || process.env.FROM,
    to,
    subject,
    html,
    attachments: finalAttachments,
  });

  return response.messageId;
}
