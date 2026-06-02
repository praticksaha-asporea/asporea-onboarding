import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import ResponseHandler from "@/lib/utils/responseUtil";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const { leadId } = req.query;
    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId as string)) {
      return ResponseHandler.sendError(res, "Valid leadId is required", 400);
    }

    const db = mongoose.connection.db;
    if (!db)
      return ResponseHandler.sendError(
        res,
        "Database connection not established",
        500,
      );
    const leadIdObj = new mongoose.Types.ObjectId(leadId as string);

    const lead = await db.collection("leads").findOne({ _id: leadIdObj });
    if (!lead) return ResponseHandler.sendError(res, "Lead not found", 404);

    const assignments = await db
      .collection("assignments")
      .find({ leadId: leadIdObj })
      .toArray();

    const preAssignment = assignments.find((a) => a.phase === "pre");
    const assessAssignment = assignments.find((a) => a.phase === "assess");
    const techAssignment = assignments.find((a) => a.phase === "tech");

    let isPreCompleted = false;
    let isAssessScheduled = false;
    let isAssessCompleted = false;

    if (preAssignment && preAssignment.status === "completed") {
      isPreCompleted = true;
    }

    if (assessAssignment) {
      isAssessScheduled = true;
      if (assessAssignment.status === "completed") {
        isAssessCompleted = true;
      }
    }

    if (techAssignment) {
    }

    let activeStep = 1;
    if (
      preAssignment ||
      [
        "pre_scheduled",
        "doc_submitted",
        "exp_submitted",
        "assessment_submitted",
      ].includes(lead.status)
    ) {
      activeStep = 2;
    }
    if (
      lead.documents?.status === "uploaded" ||
      lead.documents?.status === "verified"
    )
      activeStep = 3;
    if (lead.experience?.submittedOn || lead.status === "exp_submitted") {
      activeStep = 4;
    }

    if (lead.status === "assessment_submitted" || isAssessScheduled) {
      activeStep = 5;
    }

    if (
      lead.technical?.status === "passed" ||
      lead.technical?.status === "failed" ||
      techAssignment
    ) {
      activeStep = 6;
    }

    const formatDate = (date: any) =>
      date
        ? new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : null;

   const techStatus = lead.technical?.status;
   const isTechVisible = ['refered', 'passed', 'failed'].includes(techStatus);

    const journeyData = {
      activeStep,
      inquiry: { status: "Done", date: formatDate(lead.createdAt) },
      preCounselling: {
        status: isPreCompleted ? "Completed" : "Pending",
        date: formatDate(
          preAssignment?.updatedAt || preAssignment?.schedule?.date,
        ),
      },
      documents: {
        status:
          lead.documents?.status === "verified"
            ? "Verified"
            : lead.documents?.status === "uploaded"
              ? "Uploaded"
              : "Pending",
        date: formatDate(lead.documents?.submittedOn),
      },
      experience: {
        status:
          lead.experience?.submittedOn ||
          lead.status === "exp_submitted" ||
          isAssessScheduled
            ? "Filled"
            : "Pending",
        type: lead.experience?.type || null,
        date: formatDate(lead.experience?.submittedOn),
      },
      assessment: {
        status: isAssessCompleted
          ? "Completed"
          : isAssessScheduled
            ? "Scheduled"
            : "Pending",
        date: isAssessScheduled
          ? `${formatDate(assessAssignment?.schedule?.date)} (${assessAssignment?.schedule?.from} - ${assessAssignment?.schedule?.to})`
          : null,
        canSchedule: isPreCompleted && !isAssessScheduled,
        hasResult: isAssessCompleted,
      },
      technical: {
       status: techStatus === "passed" ? "Passed" : (techStatus === "failed" ? "Failed" : (techStatus === "refered" ? "Refered" : "Pending")),
    hasResult: techStatus === "passed" || techStatus === "failed",
    isVisible: isTechVisible, 
    date: formatDate(techAssignment?.schedule?.date) || formatDate(new Date())
      },
    };

    return ResponseHandler.sendSuccess(
      res,
      journeyData,
      "Journey fetched successfully",
    );
  } catch (error: any) {
    console.error("JOURNEY API ERROR:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
