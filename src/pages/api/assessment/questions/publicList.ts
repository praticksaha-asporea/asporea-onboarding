import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { applyCors } from "@/lib/cors";
import { questionList } from "@/lib/services/Assessments/question.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (applyCors(req, res)) return;

  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const { section, keyword } = req.query;

    const data = await questionList({
      keyword: keyword as string,
      section: section as string,
      includeDeleted: false,
      page: 1,
      limit: 150,
    });

    return ResponseHandler.sendSuccess(
      res,
      data,
      "Public assessment form configurations fetched successfully",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
