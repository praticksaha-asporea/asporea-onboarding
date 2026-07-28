import { Assignment } from "@/lib/models/Assignment.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { EscalationReportModel } from "@/lib/models/EscalationReport.model";
import { Lead } from "@/lib/models/Lead.model";
import mongoose from "mongoose";
import { getEscalationListService } from "../tac/escalate.service";
import { getTechnicalListService } from "../tac/technical.service";

export const getTeamOverview = async ({
  userId
}: { userId: string }) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const shifts = await EmployeeBranchShiftModel.find(
    { employeeId: userObjectId },
    { branchId: 1, _id: 0 }
  ).select({ branchId: 1 });

  const branchIds = shifts.map((shift) => shift.branchId);

  const assignmentSummary = await Assignment.aggregate([
    {
      $lookup: {
        from: "leads",
        localField: "leadId",
        foreignField: "_id",
        as: "lead",
      },
    },
    { $unwind: "$lead" },

    {
      $match: {
        "lead.preferences.branchId": { $in: branchIds },
      },
    },

    {
      $group: {
        _id: "$assignedTo",
        totalAssignments: { $sum: 1 },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              profilePic: 1,
            },
          },
        ],
        as: "user",
      },
    },

    { $unwind: "$user" },

    {
      $lookup: {
        from: "uploads",
        let: {
          profilePicId: {
            $convert: {
              input: "$user.profilePic",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$profilePicId"],
              },
            },
          },
        ],
        as: "userDpDetails",
      },
    },

    {
      $unwind: {
        path: "$userDpDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,
        assignedTo: "$_id",
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        totalAssignments: 1,
        profilePic: "$userDpDetails.path"
      },
    },

    {
      $sort: {
        totalAssignments: -1,
      },
    },
  ]);
  const recentEscalations = await getEscalationListService(1, 5);
  const technicalRequested = await getTechnicalListService(1, 5, '', '', 'refered');

  return {
    teamOverview: assignmentSummary,
    recentEscalations,
    technicalReviews: technicalRequested

  };
};

// ─── KPI counts for the TAC ───────────────────────────────────────────────────

// export const getTacHeadKpis = async (userId: string, role: string) => {
//   const userObjectId = new mongoose.Types.ObjectId(userId);
//   let base: any = {};
//   const shifts = await EmployeeBranchShiftModel.find(
//     { employeeId: userObjectId },
//     { branchId: 1, _id: 0 }
//   ).select({ branchId: 1 });

//   const branchIds = shifts.map((shift) => shift.branchId);

//   base["preferences.branchId"] = { $in: branchIds };

//   const candidatesSupervised = await Lead.find({
//     "preferences.branchId": { $in: branchIds },
//   }).select({ _id: 1 }).distinct("_id");
//   const [pendingEscalations, documentsAwaiting, pendingTechnical] = await Promise.all([
//     EscalationReportModel.countDocuments({
//       fromId: userObjectId,
//       status: "requested",
//       leadId: { $in: candidatesSupervised },
//     }),
//     Lead.countDocuments({ ...base, status: "doc_awaiting_approval" }),
//     Lead.countDocuments({ ...base, "experience.status": "request_technical" }),

//   ]);

//   return { pendingEscalations, documentsAwaiting, pendingTechnical, candidatesSupervised: candidatesSupervised.length };
// };
export const getTacHeadKpis = async (userId: string, role: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const branchIds = await EmployeeBranchShiftModel.distinct("branchId", {
    employeeId: userObjectId,
  });

  const baseQuery = {
    "preferences.branchId": { $in: branchIds },
  };

  const candidateIds = await Lead.distinct("_id", baseQuery);

  const [
    pendingEscalations,
    documentsAwaiting,
    pendingTechnical,
    candidatesSupervised,
  ] = await Promise.all([
    EscalationReportModel.countDocuments({
      status: "requested",
      leadId: { $in: candidateIds },
    }),

    Lead.countDocuments({
      ...baseQuery,
      status: "doc_awaiting_approval",
    }),

    Lead.countDocuments({
      ...baseQuery,
      "experience.status": "request_technical",
    }),

    Lead.countDocuments(baseQuery),
  ]);

  return {
    pendingEscalations,
    documentsAwaiting,
    pendingTechnical,
    candidatesSupervised,
  };
};
