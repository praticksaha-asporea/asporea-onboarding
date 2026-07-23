import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Lead } from "@/lib/models/Lead.model";
import { BranchTokenModel } from "@/lib/models/BranchToken.model";
import { Assignment } from "@/lib/models/Assignment.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import mongoose from "mongoose";
import "@/lib/models/User.model";
import "@/lib/models/Branch.model";
import "@/lib/models/Upload.model";
import "@/lib/models/Document.model";
import "@/lib/models/DocumentType.model";
import "@/lib/models/Position.model";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import { AssessmentModel } from "@/lib/models/Assessment.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    const userRole = String(authUser.role).toLowerCase();
    let generalSettings: any = {};
    let assessResult: any = {};
    if (userRole !== "tac" && userRole !== "foe" && userRole !== "tac_head" && userRole !== "admin")
      throw new ApiError("Unauthorized access. Insufficient permissions.", 403);

    const { id, settings } = req.query;
    
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id))
      throw new ApiError("Invalid candidate ID", 400);
    let leadFilter: Record<string, unknown> = {
      _id: new mongoose.Types.ObjectId(id),
    };
    // ─── 🌟 ROLE BASED FILTERING LOGIC 🌟 ───────────────────────────────────
    if (userRole === "foe") {
      const shift = await EmployeeBranchShiftModel.findOne({
        employeeId: new mongoose.Types.ObjectId(authUser.id),
      }).lean();
      if (!shift) throw new ApiError("FOE branch assignment not found", 404);

      leadFilter["preferences.branchId"] = shift.branchId;

    } else if (userRole === "tac_head") {
       
      const shiftInfos = await EmployeeBranchShiftModel.find({
        employeeId: new mongoose.Types.ObjectId(authUser.id),
      }).lean();

      if (!shiftInfos || shiftInfos.length === 0) {
        throw new ApiError("No branch assigned to your account. Please contact Admin.", 403);
      }

      const assignedBranchIds = [...new Set(
        shiftInfos.map(shift => shift.branchId?.toString()).filter(Boolean)
      )];

      if (assignedBranchIds.length === 0) {
        throw new ApiError("Your branch assignment data is invalid or corrupted. Please contact Admin.", 403);
      }

      const branchObjectIds = assignedBranchIds.map(bId => new mongoose.Types.ObjectId(bId));
      leadFilter["preferences.branchId"] = { $in: branchObjectIds };

    } else if (userRole === "tac") {
      // Normal TAC sirf apna khud ka assigned lead dekh sakta hai
      leadFilter["preferences.consultantId"] = new mongoose.Types.ObjectId(
        authUser.id,
      );
    }
    const lead = await Lead.findOne(leadFilter)
      .populate("preferences.branchId", "title location timeZone")
      .populate("preferences.consultantId", "firstName lastName")
      .populate("documents.position", "title")
      .lean();

    if (!lead)
      throw new ApiError("Candidate not found or not assigned to you", 404);

    if ((lead as any).createdBy && (lead as any).createdBy.id) {
      const userDoc = await mongoose.model("User")
        .findById((lead as any).createdBy.id)
        .select("notificationPreference profilePic")
        .populate("profilePic", "path")
        .lean();

      if (userDoc) {

        (lead as any).notificationPreference = (userDoc as any).notificationPreference;
        (lead as any).profilePic = (userDoc as any).profilePic?.path || null;
      }
    }

    const mappedDocsCollection =
      mongoose.models.Document || mongoose.model("Document");
    const dbUploadedFiles = await mappedDocsCollection
      .find({ leadId: new mongoose.Types.ObjectId(id) })
      .populate("typeId", "title section subTitle")
      .populate("uploadId", "path")
      .lean();

    if (lead && lead.documents) {
      (lead as any).documents.uploadedDocs = dbUploadedFiles.map(
        (doc: any) => ({
          _id: doc._id,
          typeId: doc.typeId._id,
          status: doc.status,
          title: doc.typeId?.title || "Unknown Document",
          section: doc.typeId?.section || "additional",
          path: doc.uploadId?.path || "",
        }),
      );
    }

    // Today's token for this lead
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const actualUserId = (lead as any).createdBy?.id?._id || (lead as any).createdBy?.id;
    const branchToken = await BranchTokenModel.findOne({
      userId: actualUserId,
      generateDate: { $gte: today },
    })
      .sort({ generateDate: -1, _id: -1 })
      .select("tokenNo status generateDate")
      .lean();

    // All assignments for this lead, keyed by phase
    const assignments = await Assignment.find({ leadId: id })
      .select(
        "phase status schedule token attended escalation assignedTo createdAt updatedAt pre",
      )
      .populate({
        path: "pre.initialCV",
        model: "Upload",
        select: "path",
      })
      .populate("assignedTo", "firstName lastName")
      .lean();

    // Build a phase map for easy lookup on the frontend
    const assignmentByPhase: Record<string, any> = {};
    for (const a of assignments) {
      assignmentByPhase[(a as any).phase] = a;
    }

    if (settings === "true") {
      generalSettings = await GeneralSettingModel.findOne().lean();
    }
    // console.log(assignmentByPhase["assess"],1612165);
    
    if(assignmentByPhase?.["assess"]?.status==="completed")
    {
      assessResult= await AssessmentModel.findOne({leadId: lead?._id})
    }
    return ResponseHandler.sendSuccess(
      res,
      { lead, branchToken, assignments, assignmentByPhase, generalSettings,assessResult },
      "Candidate fetched",
    );
  } catch (error: unknown) {
    console.log(error,13516);
    
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
