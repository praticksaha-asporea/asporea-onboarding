import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { normalizeFormFields, parseForm } from "@/lib/utils/parseForm";
import { addTechnicalResultSchema } from "@/lib/validation/technicalValidation";
import { uploadFileService } from "@/lib/services/upload.service";
import { addTechnicalResult } from "@/lib/services/Assessments/technical.service";
import { TechnicalDetailModel } from "@/lib/models/TechnicalDetail.model";
export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "POST" && req.method !== "PUT") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    const userRole = String(authUser.role).toLowerCase();

    if (!["admin", "tac_head", "branch_head"].includes(userRole)) {
      throw new ApiError(
        "Unauthorized. Only managers/heads update technical status.",
        403,
      );
    }

    const { fields, files } = await parseForm(req);
    type UploadResult = {
      uploadId: string;
      path: string;
    };
    let result: UploadResult | null = null;
    const existingResult = await TechnicalDetailModel.findOne({
      leadId: fields.leadId
    });

    if (existingResult) {
      throw new ApiError(
        `Technical result already exists for this candidate.`,
        409
      );
    }
    if (files?.breakdownPdf) {

      result = await uploadFileService({
        file: files?.breakdownPdf,
        userId: authUser?.id,
      });
    }

    const body = normalizeFormFields(
      fields as any
    );
    const { error } = addTechnicalResultSchema.validate(body);
    if (error) {
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);
    }

    const addTechnicalStatus = {
      leadId: body.leadId,
      type: body.type,
      totalScore: body.totalScore,
      achievedScore: body.achievedScore,
      timeTaken: body.timeTaken,
      questions: body.questions,
      answered: body.answered,
      ...(files && result?.uploadId !== undefined && {
        breakdownPdf: result.uploadId,
      }),
      feedback: body.feedback,
      actionBy: authUser?.id
    };

    // if (!["passed", "failed"].includes(body.status)) {
    //   throw new ApiError("Status must be either 'passed' or 'failed'", 400);
    // }
    const data = await addTechnicalResult(addTechnicalStatus);

    return ResponseHandler.sendSuccess(
      res,
      data,
      `Technical request has been updated successfully.`,
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("Technical ACTION API ERROR:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
