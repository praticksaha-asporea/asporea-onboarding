import { TransferLeadModel } from "@/lib/models/TransferLead.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import "@/lib/models/User.model";
import "@/lib/models/Upload.model"
import { Assignment } from "@/lib/models/Assignment.model";
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import mongoose from "mongoose";

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
   

  return newTransfer;
};



export const getTransferListService = async (
  page = 1,
  limit = 10,
  filterUserId?: string | null,
  search?: string,
  tacId?: string
) => {
  const skip = (page - 1) * limit;

  let matchQuery: any = {};
  let leadMatchQuery: any = {};


  if (tacId && mongoose.Types.ObjectId.isValid(tacId)) {
    matchQuery.toId = new mongoose.Types.ObjectId(tacId);
  }


  if (search) {
    const searchRegex = new RegExp(search, "i");
    leadMatchQuery.$or = [
      { fullName: searchRegex },
      { inqNo: searchRegex }
    ];


    if (!isNaN(Number(search))) {
      leadMatchQuery.$or.push({ inquiryNumber: Number(search) });
    }
  }


  if (filterUserId) {
    const shiftInfos = await EmployeeBranchShiftModel.find({
      employeeId: new mongoose.Types.ObjectId(filterUserId),
    }).lean();

    if (!shiftInfos || shiftInfos.length === 0) {
      throw new ApiError(
        "No branch assigned to your account. Please contact Admin.",
        403,
      );
    }

    const assignedBranchIds = [
      ...new Set(
        shiftInfos.map((shift) => shift.branchId?.toString()).filter(Boolean),
      ),
    ];

    if (assignedBranchIds.length === 0) {
      throw new ApiError(
        "Your branch assignment data is invalid or corrupted. Please contact Admin.",
        403,
      );
    }

    const branchObjectIds = assignedBranchIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );


    leadMatchQuery["preferences.branchId"] = { $in: branchObjectIds };
  }


  if (Object.keys(leadMatchQuery).length > 0) {
    const matchingLeads = await Lead.find(leadMatchQuery).select("_id").lean();
    const branchLeadIds = matchingLeads.map((lead) => lead._id);


    if (branchLeadIds.length === 0) {
      return {
        transfers: [],
        meta: { totalRecords: 0, currentPage: page, totalPages: 0 },
      };
    }
    matchQuery.leadId = { $in: branchLeadIds };
  }

  const totalRecords = await TransferLeadModel.countDocuments(matchQuery);

  const transfers = await TransferLeadModel.find(matchQuery)
    .populate({
      path: "fromId",
      select: "firstName lastName email role profilePic",
      populate: { path: "profilePic", select: "path" }
    })
    .populate({
      path: "toId",
      select: "firstName lastName email role profilePic",
      populate: { path: "profilePic", select: "path" }
    })
    .populate({
      path: "leadId",
      select: "fullName status inqNo preferences createdBy",
      populate: {
        path: "createdBy.id",
        model: "User",
        select: "profilePic",
        populate: { path: "profilePic", select: "path" }
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return {
    transfers,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};

export const getETransferLeadByIdService = async (transferId: string) => {
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

export const updateTransferLeadStatusService = async (
  transferId: string,
  status: "approved" | "rejected",
  remarks?: string,
  newSchedule?: NewScheduleInfo,
) => {
  const transfer = await TransferLeadModel.findById(transferId);

  if (!transfer) throw new ApiError("Transfer record not found", 404);
  if (transfer.status !== "requested") {
    throw new ApiError(
      `Cannot update. Request is already ${transfer.status}`,
      400,
    );
  }

  let pendingAssignments: any[] = [];

  if (status === "approved") {
    pendingAssignments = await Assignment.find({
      leadId: transfer.leadId,
      assignedTo: transfer.fromId,
      "transfer.requested": true,
    });

    if (pendingAssignments.length > 0) {
      const assignmentNeedingSchedule = pendingAssignments.find(
        (a) => ["pre", "assess"].includes(a.phase) && a.status === "assigned",
      );

      if (assignmentNeedingSchedule) {
        if (
          !newSchedule ||
          !newSchedule.date ||
          !newSchedule.from ||
          !newSchedule.to
        ) {
          throw new ApiError(
            `A new schedule is mandatory. BUT BACKEND RECEIVED: ${JSON.stringify(newSchedule)}`,
            400,
          );
        }

        const startOfDay = new Date(newSchedule.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(newSchedule.date);
        endOfDay.setHours(23, 59, 59, 999);

        const slotConflict = await Assignment.findOne({
          assignedTo: transfer.toId,
          "schedule.date": { $gte: startOfDay, $lte: endOfDay },
          "schedule.from": newSchedule.from,
          status: { $ne: "rejected" },
        });

        if (slotConflict) {
          throw new ApiError(
            "The selected target consultant is already booked at this specific time slot. Please select another slot.",
            409,
          );
        }
      }
    }
  }

  transfer.status = status;
  if (remarks) transfer.remarks = remarks;
  transfer.actionedAt = new Date();
  await transfer.save();

  if (status === "approved") {
    await Lead.findByIdAndUpdate(transfer.leadId, {
      $set: {
        "preferences.consultantId": transfer.toId,
        transferredTo: transfer.toId,
      },
    });

    for (let pendingAssignment of pendingAssignments) {
      const requiresSchedule =
        ["pre", "assess"].includes(pendingAssignment.phase) &&
        pendingAssignment.status === "assigned";

      if (requiresSchedule && newSchedule) {
        pendingAssignment.schedule.date = new Date(newSchedule.date);
        pendingAssignment.schedule.from = newSchedule.from;
        pendingAssignment.schedule.to = newSchedule.to;
        if (newSchedule.method)
          pendingAssignment.schedule.method = newSchedule.method;
      }

      pendingAssignment.assignedTo = transfer.toId;
      pendingAssignment.transfer.requested = false;
      pendingAssignment.transfer.transferredTo = undefined;
      await pendingAssignment.save();
    }
  } else if (status === "rejected") {
    await Assignment.updateMany(
      { leadId: transfer.leadId, assignedTo: transfer.fromId },
      {
        $set: { "transfer.requested": false },
        $unset: { "transfer.transferredTo": 1 },
      },
    );
  }

  return transfer;
};
