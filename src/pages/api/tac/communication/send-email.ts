import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { sendMail } from "@/lib/utils/emailUtil";
import { Lead } from "@/lib/models/Lead.model";
import User from "@/lib/models/User.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac" && authUser.role !== "tac_head") {
      throw new ApiError("Unauthorized access.", 403);
    }

    const { leadId, message } = req.body;
    if (!leadId || !message) {
      throw new ApiError("Lead ID and message are required", 400);
    }

    const lead = await Lead.findById(leadId).select("contact fullName");
    if (!lead || !lead.contact?.email) {
      throw new ApiError("Candidate email not found", 404);
    }

    const tacUser = await User.findById(authUser.id || (authUser as any)._id).select("firstName lastName email");
    
    const senderName = tacUser ? `${tacUser.firstName} ${tacUser.lastName}` : "Your TAC Consultant";
    const senderEmail = tacUser?.email;  

    
   const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        
        <!-- ✅ TEXT HATA KAR LOGO LAGA DIYA -->
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

    return ResponseHandler.sendSuccess(res, null, "Email sent successfully.");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("SEND TAC EMAIL ERROR:", error);
    return ResponseHandler.sendError(
      res,
      "Failed to send email. Server error.",
      500,
    );
  }
}
