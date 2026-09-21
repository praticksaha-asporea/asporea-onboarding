import { TransferLeadModel } from "@/lib/models/TransferLead.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import "@/lib/models/User.model";
import "@/lib/models/Upload.model"
import { Assignment } from "@/lib/models/Assignment.model";
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import mongoose from "mongoose";
import { EscalationModel } from "@/lib/models/Escalation.model";
import { createLeadLogService } from "@/lib/services/leadActivity/leadLog.service";
import User from "@/lib/models/User.model";

interface TransferPayload {
  fromId: string;
  toId: string;
  leadId: string;
  reason: string;
}

interface NewScheduleInfo {
  date: string;
  from: string;
  to: string;
  method?: "on" | "off";
}

export const createTransferLeadService = async (payload: TransferPayload) => {
  const { fromId, toId, leadId, reason } = payload;

  if (!leadId || !toId || !reason) {
    throw new ApiError("Lead ID, Transfer TAC, and Reason are required", 400);
  }

  const existingTransfer = await TransferLeadModel.findOne({
    leadId,
    status: { $in: ["requested", "approved"] },
  });

  if (existingTransfer) {
    if (existingTransfer.status === "requested") {
      throw new ApiError(
        "Transfer request already submitted and awaiting manager approval.",
        400,
      );
    } else {
      throw new ApiError("This candidate has a history of transfer.", 400);
    }
  }
  const newTransfer = await TransferLeadModel.create({
    fromId,
    toId,
    leadId,
    reason,
    status: "approved",
    actionedAt: new Date(),
  });

  await Lead.findByIdAndUpdate(leadId, {
    $set: {
      "preferences.consultantId": toId,
      transferredTo: toId,
    },
  });

  await Assignment.updateMany(
    { leadId: leadId, assignedTo: fromId },
    {
      $set: {
        assignedTo: toId,
        "transfer.requested": false,
      },
      $unset: { "transfer.transferredTo": 1 },
    }
  );

const targetUser = await User.findById(toId)
    .select("firstName lastName")
    .lean();

  const targetName = targetUser
    ? `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim()
    : "another TAC";

  const reasonText = reason?.trim() ? ` (Reason: ${reason.trim()})` : "";
  const actionType = "LEAD_TRANSFERRED_BY_TAC";
  const actionNote = `Lead transferred to TAC ${targetName}${reasonText}`;

  await createLeadLogService(
    String(leadId),
    actionType,
    actionNote,
    fromId
  );

  return newTransfer;
};



export const getEscalationListService = async (
  page = 1,
  limit = 10,
  tacId?: string,
  search?: string,
  filterUserId?: string | null
) => {
  const skip = (page - 1) * limit;

  const matchQuery: Record<string, any> = {};
  const leadMatchQuery: Record<string, any> = {};

  // Filter by escalated TAC
  if (tacId && mongoose.Types.ObjectId.isValid(tacId)) {
    matchQuery.fromId = new mongoose.Types.ObjectId(tacId);
  }

  // Search Lead
  if (search?.trim()) {
    const searchValue = search.trim();
    const searchRegex = new RegExp(searchValue, "i");

    leadMatchQuery.$or = [
      { fullName: searchRegex },
      { inqNo: searchRegex },
    ];

    if (!isNaN(Number(searchValue))) {
      leadMatchQuery.$or.push({
        inquiryNumber: Number(searchValue),
      });
    }
  }

  // Filter by user's assigned branches
  if (filterUserId) {
    if (!mongoose.Types.ObjectId.isValid(filterUserId)) {
      throw new ApiError("Invalid user ID", 400);
    }

    const branchIds = await EmployeeBranchShiftModel.distinct(
      "branchId",
      {
        employeeId: new mongoose.Types.ObjectId(filterUserId),
      }
    );

    if (!branchIds.length) {
      throw new ApiError(
        "No branch assigned to your account. Please contact Admin.",
        403
      );
    }

    leadMatchQuery["preferences.branchId"] = {
      $in: branchIds,
    };
  }

  // Convert Lead filters into Escalation leadId filter
  if (Object.keys(leadMatchQuery).length) {
    const leadIds = await Lead.find(leadMatchQuery)
      .select("_id")
      .lean();

    if (!leadIds.length) {
      return {
        escalations: [],
        meta: {
          totalRecords: 0,
          currentPage: page,
          totalPages: 0,
        },
      };
    }

    matchQuery.leadId = {
      $in: leadIds.map(({ _id }) => _id),
    };
  }

  // Count + data in parallel
  const [totalRecords, escalations] = await Promise.all([
    EscalationModel.countDocuments(matchQuery),

    EscalationModel.find(matchQuery)
      .populate({
        path: "fromId",
        select: "firstName lastName email role profilePic",
        populate: {
          path: "profilePic",
          select: "path",
        },
      })
      .populate({
        path: "leadId",
        select: `
          fullName
          status
          inqNo
          inquiryNumber
          preferences
          source
          experience
          createdBy
        `,
        populate: [
          {
            path: "preferences.branchId",
            select: "title",
          },
          {
            path: "preferences.consultantId",
            select: "firstName lastName",
          },
          {
            path: "createdBy.id",
            model: "User",
            select: "firstName lastName email profilePic",
            populate: {
              path: "profilePic",
              select: "path",
            },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Get candidate profiles for these leads
  const leadIds = escalations.map((item) => item.leadId?._id);

  const candidates = leadIds.length
    ? await User.find({
      "candidateProfile.leadId": {
        $in: leadIds,
      },
    })
      .select(
        "firstName lastName email phone profilePic candidateProfile"
      )
      .populate("profilePic", "path")
      .lean()
    : [];

  const candidateMap = new Map(
    candidates.map((user) => [
      user.candidateProfile?.leadId?.toString(),
      user,
    ])
  );

  const result = escalations.map((escalation) => ({
    ...escalation,

    candidate:
      candidateMap.get(
        escalation.leadId?._id?.toString()
      ) ?? null,
  }));

  return {
    escalations: result,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};

export const getEscalationLeadByIdService = async (transferId: string) => {
  if (!transferId || !mongoose.Types.ObjectId.isValid(transferId)) {
    throw new ApiError("Valid Transfer ID is required", 400);
  }

  const transfer = await TransferLeadModel.findById(transferId)

    .populate({
      path: "fromId",
      select: "firstName lastName email role phoneNumber whatsappNumber",
    })
    .populate({
      path: "toId",
      select: "firstName lastName email role phoneNumber whatsappNumber",
    })
    .populate("leadId")
    .lean();

  if (!transfer) {
    throw new ApiError("Transfer record not found", 404);
  }

  return transfer;
};

export const updateEscalationLeadStatusService = async (
  escalateId: string,
  // status: "approved" | "rejected",
  remarks?: string,
  // newSchedule?: NewScheduleInfo,
) => {
  const escalation = await EscalationModel.findById(escalateId);

  if (!escalation) throw new ApiError("Escalation record not found", 404);
  if (escalation.status !== "requested") {
    throw new ApiError(
      `Cannot update. Request is already ${escalation.status}`,
      400,
    );
  }

  escalation.status = "actionTaken";
  if (remarks) escalation.remarks = remarks;
  escalation.actionedAt = new Date();
  await escalation.save();

  await Lead.findByIdAndUpdate(escalation.leadId, {
    $set: {
      escalated: false,
    },
  });

  return escalation;
};
