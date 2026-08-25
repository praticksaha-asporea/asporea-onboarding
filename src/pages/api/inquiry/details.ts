import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { getInquiryByIdService } from "@/lib/services/Inquiry/inquiry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const { id } = req.query;
    const data = await getInquiryByIdService(id as string);
    return ResponseHandler.sendSuccess(
      res,
      data,
      "Inquiry fetched successfully",
    );
  } catch (error: any) {
    return ResponseHandler.sendError(res, error.message, error.statusCode);
  }
}
