import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Assignment } from "@/lib/models/Assignment.model";
import mongoose from "mongoose";
import Joi from "joi";
import { normalizeFormFields, parseForm } from "@/lib/utils/parseForm";
import { Lead } from "@/lib/models/Lead.model";
import { DocumentModel } from "@/lib/models/Document.model";


const updateAssignmentExperienceSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required(),

    status: Joi.string()
        .valid(
            "verified",
            "rejected",
            "refer_technical"
        )
        .optional(),
    expType: Joi.string()
        .valid(
            "fresher", "domestic", "abroad", "free"
        )
        .optional()
})
    .options({
        abortEarly: false,
        allowUnknown: true, // IMPORTANT for multipart/form-data
    });
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (applyCors(req, res)) return;
    await connectToDatabase();

    if (req.method !== "PATCH" && req.method !== "PUT")
        return ResponseHandler.sendError(res, "Method not allowed", 405);

    try {
        const token = getTokenFromHeader(req);
        if (!token) throw new ApiError("Unauthenticated user", 401);

        const authUser = await verifyToken(token);
        if (authUser.role !== "tac") throw new ApiError("TAC access required", 403);
        const { fields } = await parseForm(req);
        const body = normalizeFormFields(
            fields as any
        );
        const { error, value } = updateAssignmentExperienceSchema.validate(body);

        if (error)
            throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

        const { id, status, expType } = value;

        if (!mongoose.Types.ObjectId.isValid(id))
            throw new ApiError("Invalid assignment ID", 400);

        // Verify the assignment belongs to this TAC
        const assignment = await Assignment.findOne({
            _id: id,
            assignedTo: new mongoose.Types.ObjectId(authUser.id),
        });
        if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);
        if (!assignment?.token?.number && assignment?.schedule?.method == "off") throw new ApiError("Token not generated yet", 404)

        let
            leadUpdate = { "experience.status": status , "experience.type": expType, status: `exp_${status}`, actionBy: new mongoose.Types.ObjectId(authUser.id) };
        
        const updatedLead=await Lead.findByIdAndUpdate(
            assignment?.leadId,
            { $set: leadUpdate },
            { returnDocument: "after", runValidators: true }
        );
        if(status==='refer_technical')
        {
            // Refer Technical
        }

        return ResponseHandler.sendSuccess(res, updatedLead, "Experience status updated");
    } catch (error: unknown) {

        if (error instanceof ApiError)
            return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
        return ResponseHandler.sendError(res, "Unknown error occurred", 500);
    }
}
