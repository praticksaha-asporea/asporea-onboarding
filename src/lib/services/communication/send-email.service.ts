import { ApiError } from "@/lib/error/api.error";
import { Lead } from "@/lib/models/Lead.model";
import User from "@/lib/models/User.model";
import connectToDatabase from "@/lib/mongodb";
import { sendMail } from "@/lib/utils/emailUtil";

export interface ISendCandidateEmailPayload {
  leadId: string;
  message: string;
}

export interface IAuthUserContext {
  id: string;
  role: string;
  [key: string]: any;
}

export const sendCandidateEmailService = async (
  payload: ISendCandidateEmailPayload,
  authUser: IAuthUserContext
) => {
  if (authUser.role !== "tac" && authUser.role !== "tac_head") {
    throw new ApiError("Unauthorized access.", 403);
  }

  const { leadId, message } = payload;
  if (!leadId || !message) {
    throw new ApiError("Lead ID and message are required", 400);
  }

  await connectToDatabase();

  const lead = await Lead.findById(leadId).select("contact fullName");
  if (!lead || !lead.contact?.email) {
    throw new ApiError("Candidate email not found", 404);
  }

  const tacUser = await User.findById(authUser.id || (authUser as any)._id).select(
    "firstName lastName email"
  );

  const senderName = tacUser
    ? `${tacUser.firstName} ${tacUser.lastName}`
    : "Your TAC Consultant";
  const senderEmail = tacUser?.email;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img 
          src="https://asporea.co.in/sites/default/files/logo.png" 
          alt="Asporea" 
          style="max-width: 180px; height: auto; display: inline-block; border: none; outline: none;" 
        />
      </div>

      <p>Dear <strong>${lead.fullName}</strong>,</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #007FFF; margin: 20px 0;">
        <p style="white-space: pre-wrap; margin: 0;">${message}</p>
      </div>

      <p style="margin-top: 20px;">Best Regards,<br/>
      <strong>${senderName}</strong><br/>
      <span style="color: #666; font-size: 12px;">TAC Consultant at Asporea</span></p>
    </div>
  `;

  await sendMail({
    to: lead.contact.email,
    subject: `Update regarding your application from ${senderName}`,
    html: htmlContent,
    fromName: senderName,
    replyTo: senderEmail,
  });

  return true;
};