import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Lead } from "@/lib/models/Lead.model";
import { BranchTokenModel } from "@/lib/models/BranchToken.model";
import { Assignment } from "@/lib/models/Assignment.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";  
import mongoose from "mongoose";
import "@/lib/models/User.model";
import "@/lib/models/Branch.model";
import "@/lib/models/Upload.model";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac" && authUser.role !== "foe") throw new ApiError("TAC or FOE access required", 403);

    const { id } = req.query;
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id))
      throw new ApiError("Invalid candidate ID", 400);
     let leadFilter: Record<string, unknown> = { _id: new mongoose.Types.ObjectId(id) };
     if (authUser.role === "foe") {
        
      const shift = await EmployeeBranchShiftModel.findOne({ employeeId: new mongoose.Types.ObjectId(authUser.id) }).lean();
      if (!shift) throw new ApiError("FOE branch assignment not found", 404);
      
      leadFilter["preferences.branchId"] = shift.branchId;
    } else {
       
      leadFilter["preferences.consultantId"] = new mongoose.Types.ObjectId(authUser.id);
    }
     const lead = await Lead.findOne(leadFilter)
      .populate("preferences.branchId", "title location timeZone")
      .populate("preferences.consultantId", "firstName lastName")
      .lean();

    if (!lead) throw new ApiError("Candidate not found or not assigned to you", 404);

    // Today's token for this lead
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const branchToken = await BranchTokenModel.findOne({
      userId: (lead as any).createdBy.id,
      generateDate: { $gte: today },
    })
    .sort({ generateDate: -1, _id: -1 })
      .select("tokenNo status generateDate")
      .lean();

    // All assignments for this lead, keyed by phase
    const assignments = await Assignment.find({ leadId: id })
      .select("phase status schedule token attended escalation assignedTo createdAt updatedAt pre")
      .populate({
    path: "pre.initialCV",
    model: "Upload",
    select: "path",
  })
      .lean();

    // Build a phase map for easy lookup on the frontend
    const assignmentByPhase: Record<string, any> = {};
    for (const a of assignments) {
      assignmentByPhase[(a as any).phase] = a;
    }

    return ResponseHandler.sendSuccess(
      res,
      { lead, branchToken, assignments, assignmentByPhase },
      "Candidate fetched",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
