import { EscalationReportModel } from "@/lib/models/EscalationReport.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";  
import "@/lib/models/User.model";
import { Assignment } from "@/lib/models/Assignment.model";
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import mongoose from "mongoose";

interface EscalatePayload {
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

export const createEscalationService = async (payload: EscalatePayload) => {
  const { fromId, toId, leadId, reason } = payload;

  if (!leadId || !toId || !reason) {
    throw new ApiError("Lead ID, Escalation TAC, and Reason are required", 400);
  }

  const existingEscalation = await EscalationReportModel.findOne({
    leadId,
    status: { $in: ["requested", "approved"] },
  });

  if (existingEscalation) {
    if (existingEscalation.status === "requested") {
      throw new ApiError(
        "Escalation request already submitted and awaiting manager approval.",
        400,
      );
    } else {
      throw new ApiError("This candidate has a history of escalation.", 400);
    }
  }
  const newEscalation = await EscalationReportModel.create({
    fromId,
    toId,
    leadId,
    reason,
    status: "requested",
  });

  await Assignment.updateMany(
    { leadId: leadId, assignedTo: fromId },
    {
      $set: {
        "escalation.requested": true,
        "escalation.escalatedTo": toId,
      },
    },
  );

  return newEscalation;
};

export const getEscalationListService = async (page = 1, limit = 10,filterUserId?: string | null) => {
  const skip = (page - 1) * limit;

  let matchQuery: any = {};

  if (filterUserId) {
   
    const shiftInfos = await EmployeeBranchShiftModel.find({ employeeId:new mongoose.Types.ObjectId(filterUserId) }).lean();
    
  if (!shiftInfos || shiftInfos.length === 0) {
      throw new ApiError("No branch assigned to your account. Please contact Admin.", 403);
    }

    const assignedBranchIds = [...new Set(
      shiftInfos.map(shift => shift.branchId?.toString()).filter(Boolean)
    )];

    if (assignedBranchIds.length === 0) {
      throw new ApiError("Your branch assignment data is invalid or corrupted. Please contact Admin.", 403);
    }
 
    const branchObjectIds = assignedBranchIds.map(id => new mongoose.Types.ObjectId(id));
   const branchLeads = await Lead.find({ 
      "preferences.branchId": { $in: branchObjectIds } 
    }).select("_id").lean();
    
    const branchLeadIds = branchLeads.map((lead) => lead._id);

    if (branchLeadIds.length === 0) {
      return {
        escalations: [],
        meta: { totalRecords: 0, currentPage: page, totalPages: 0 }
      };
    }
     
    matchQuery = { leadId: { $in: branchLeadIds } };
  }

  const totalRecords = await EscalationReportModel.countDocuments(matchQuery);

  const escalations = await EscalationReportModel.find()
     
    .populate({
      path: "fromId",
      select: "firstName lastName email role",
    })
    .populate({
      path: "toId",
      select: "firstName lastName email role",
    })
    .populate("leadId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    escalations,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};

export const getEscalationByIdService = async (escalationId: string) => {
  if (!escalationId || !mongoose.Types.ObjectId.isValid(escalationId)) {
    throw new ApiError("Valid Escalation ID is required", 400);
  }

  const escalation = await EscalationReportModel.findById(escalationId)

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

  if (!escalation) {
    throw new ApiError("Escalation record not found", 404);
  }

  return escalation;
};

export const updateEscalationStatusService = async (
  escalationId: string,
  status: "approved" | "rejected",
  remarks?: string,
  newSchedule?: NewScheduleInfo,
) => {
  const escalation = await EscalationReportModel.findById(escalationId);

  if (!escalation) throw new ApiError("Escalation record not found", 404);
  if (escalation.status !== "requested") {
    throw new ApiError(`Cannot update. Request is already ${escalation.status}`, 400);
  }

   
  let pendingAssignment: any = null;

  if (status === "approved") {
    pendingAssignment = await Assignment.findOne({
      leadId: escalation.leadId,
      assignedTo: escalation.fromId,
      "escalation.requested": true
    });

    if (pendingAssignment) {
      const requiresSchedule = 
        ["pre", "assess"].includes(pendingAssignment.phase) && 
        pendingAssignment.status === "assigned";

      if (requiresSchedule) {
        
        
        if (!newSchedule || !newSchedule.date || !newSchedule.from || !newSchedule.to) {
          throw new ApiError(
            `A new schedule is mandatory. BUT BACKEND RECEIVED: ${JSON.stringify(newSchedule)}`, 
            400
          );
        }

        const startOfDay = new Date(newSchedule.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(newSchedule.date);
        endOfDay.setHours(23, 59, 59, 999);

       
        const slotConflict = await Assignment.findOne({
          assignedTo: escalation.toId, 
          "schedule.date": { $gte: startOfDay, $lte: endOfDay },
          "schedule.from": newSchedule.from,
          status: { $ne: "rejected" },
        });

        if (slotConflict) {
          throw new ApiError("The selected target consultant is already booked at this specific time slot. Please select another slot.", 409);
        }
      }
    }
  }

  
  
  escalation.status = status;
  if (remarks) escalation.remarks = remarks;
  escalation.actionedAt = new Date();
  await escalation.save();  

  if (status === "approved") {
    
    
    await Lead.findByIdAndUpdate(escalation.leadId, {
      $set: {
        "preferences.consultantId": escalation.toId, 
        "escalatedTo": escalation.toId 
      }
    });  
 
    if (pendingAssignment) {
      const requiresSchedule = 
        ["pre", "assess"].includes(pendingAssignment.phase) && 
        pendingAssignment.status === "assigned";

      if (requiresSchedule && newSchedule) {
        pendingAssignment.schedule.date = new Date(newSchedule.date);
        pendingAssignment.schedule.from = newSchedule.from;
        pendingAssignment.schedule.to = newSchedule.to;
        if (newSchedule.method) pendingAssignment.schedule.method = newSchedule.method;
      }

      pendingAssignment.assignedTo = escalation.toId;
      pendingAssignment.escalation.requested = false;
      pendingAssignment.escalation.escalatedTo = undefined;
      await pendingAssignment.save();  
    }
    
  } else if (status === "rejected") {
    await Assignment.updateMany(
      { leadId: escalation.leadId, assignedTo: escalation.fromId },
      {
        $set: { "escalation.requested": false },
        $unset: { "escalation.escalatedTo": 1 },
      },
    );  
  }
  
  return escalation;
};

 