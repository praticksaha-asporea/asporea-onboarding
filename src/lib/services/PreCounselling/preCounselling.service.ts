import mongoose from "mongoose";
import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";

import "../../models/ShiftSchedule.model";
import { Assignment } from "../../models/Assignment.model";
import { ApiError } from "../../error/api.error";

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;

  const parts = timeStr.trim().split(/\s+/);
  const time = parts[0];
  const modifier = parts[1]?.toUpperCase();

  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + (minutes || 0);
};

const formatTime12Hr = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  const formattedMin = m.toString().padStart(2, "0");
  return `${formattedHour.toString().padStart(2, "0")}:${formattedMin} ${ampm}`;
};

 export const getConsultantSlots = async (
  consultantId: string,
  targetDateStr: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(consultantId)) {
    throw new ApiError("Invalid Consultant ID", 400);
  }

  const User = mongoose.models.User || mongoose.model("User");
  const tacExists = await User.findById(consultantId);
  if (!tacExists) {
    throw new ApiError("Consultant not found in the database", 404);
  }

  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) {
    throw new ApiError("Invalid Date Format. Use YYYY-MM-DD", 400);
  }

 
  const allAssignments = await EmployeeBranchShiftModel.find({
    employeeId: new mongoose.Types.ObjectId(consultantId),
  }).lean();

  if (!allAssignments || allAssignments.length === 0) {
    return [];
  }

 
  const validAssignments = allAssignments
    .filter((a: any) => {
     
      if (!a.effectiveFrom) return true; 
      
      const effectiveDate = new Date(a.effectiveFrom);
      effectiveDate.setHours(0, 0, 0, 0);  
      
      const comparisonTarget = new Date(targetDate);
      comparisonTarget.setHours(0, 0, 0, 0);
       
      return effectiveDate.getTime() <= comparisonTarget.getTime();
    })
    .sort((a: any, b: any) => {
      const dateA = a.effectiveFrom ? new Date(a.effectiveFrom).getTime() : 0;
      const dateB = b.effectiveFrom ? new Date(b.effectiveFrom).getTime() : 0;
      //  console.log(dateA-dateB,787777)
      return dateB - dateA;
    });

   
  const activeAssignment = validAssignments[0];

  if (!activeAssignment) {
    return [];  
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const targetDay = daysOfWeek[targetDate.getDay()];

  const ShiftScheduleModel =
    mongoose.models.ShiftSchedule || mongoose.model("ShiftSchedule");
    
  
  const schedule = await ShiftScheduleModel.findOne({
    shiftId: activeAssignment.shiftId,
    days: targetDay,
  });

  if (!schedule) {
    return [];
  }

 
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await Assignment.find({
    assignedTo: new mongoose.Types.ObjectId(consultantId),
    "schedule.date": { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: "rejected" },
  });

  const bookedFromTimes = existingBookings.map((b) => b.schedule?.from);

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];
  const isToday = targetDateStr === todayStr;
  const isPastDate = targetDateStr < todayStr;
  const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();
  
  let startMins = timeToMinutes(schedule.startTime);
  let endMins = timeToMinutes(schedule.endTime);

  if (endMins === 0) {
    endMins = 1440;
  }

  const interval = activeAssignment?.minuteOfSlots || 30;

  const slots = [];
  let currentMins = startMins;

  while (currentMins + interval <= endMins) {
    const fromStr = formatTime12Hr(currentMins);
    const toStr = formatTime12Hr(currentMins + interval);
    const slotLabel = `${fromStr} - ${toStr}`;

    let isAvailable = true;

    if (isPastDate) {
       
      isAvailable = false;
    } else if (isToday && currentMins <= currentMinutes) {
      
      isAvailable = false;
    }

    if (bookedFromTimes.includes(fromStr)) {
      
      isAvailable = false;
    }

    slots.push({
      time: slotLabel,
      from: fromStr,
      to: toStr,
      available: isAvailable,
    });

    currentMins += interval;
  }

  return slots;
};

export const savePreCounsellingBooking = async (body: any) => {
  const { leadId, consultantId, date, from, to, method } = body;

  if (!leadId || !consultantId || !date || !from || !to) {
    throw new ApiError("Missing required fields for booking", 400);
  }

  const targetDate = new Date(date);
  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000); // Current IST Time

  const targetDateStr = targetDate.toISOString().split("T")[0];
  const todayStr = istTime.toISOString().split("T")[0];

  if (targetDateStr < todayStr) {
    throw new ApiError(
      "Please Choose Another Slot , This Slot unavailable Now.",
      400,
    );
  }

  if (targetDateStr === todayStr) {
    const requestedMins = timeToMinutes(from);
    const currentMins = istTime.getHours() * 60 + istTime.getMinutes();

    if (requestedMins <= currentMins) {
      throw new ApiError(
        "Cannot book a slot in the past. Please select a future time.",
        400,
      );
    }
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const slotConflict = await Assignment.findOne({
    assignedTo: new mongoose.Types.ObjectId(consultantId),
    "schedule.date": { $gte: startOfDay, $lte: endOfDay },
    "schedule.from": from,
    status: { $ne: "rejected" },
  });

  if (slotConflict) {
    throw new ApiError(
      "This slot has already been booked. Please choose another slot.",
      409,
    );
  }
 
  const LeadModel = mongoose.models.Lead || mongoose.model("Lead");
  const currentLead = await LeadModel.findById(leadId).lean();
  
   // Clear any existing pre-counselling assignments and branch tokens if the lead is in certain statuses
  const preClearStatuses = ["pre_not_responded", "pre_scheduled", "pre_contacted", "pre_queued"];
  if (currentLead && preClearStatuses.includes(currentLead.status)) {
    await Assignment.deleteMany({
      leadId: new mongoose.Types.ObjectId(leadId),
      phase: "pre"
    });

     
    const BranchTokenModel = mongoose.models.BranchToken || mongoose.model("BranchToken");
    const creatorId = currentLead.createdBy?.id || currentLead.createdBy?._id || currentLead.createdBy;
   if (creatorId && currentLead.preferences?.branchId) {
      await BranchTokenModel.deleteMany({
        userId: creatorId, 
        branchId: currentLead.preferences.branchId,
        status: { $in: ["generated", "queued"] }
      });
    }
  }
  

   
  const updatedAssignment = await Assignment.findOneAndUpdate(
    { leadId: new mongoose.Types.ObjectId(leadId), phase: "pre" },
    {
      $set: {
        assignedTo: new mongoose.Types.ObjectId(consultantId),
        schedule: {
          date: new Date(date),
          from,
          to,
          method: method || "off",
        },
        status: "assigned",
        attended: false,
        token: {
          generated: false,  
          number: null
        }
      },
    },
    { new: true, upsert: true },
  );

  if (updatedAssignment) {
    await LeadModel.findByIdAndUpdate(leadId, {
      status: "pre_scheduled",
      "preferences.consultantId": new mongoose.Types.ObjectId(consultantId)
    });
  }

  return updatedAssignment;
};

export const saveAssessmentBooking = async (body: any) => {
  const { leadId, consultantId, date, from, to, method } = body;

  if (!leadId || !consultantId || !date || !from || !to) {
    throw new ApiError("Missing required fields for Assessment booking", 400);
  }

  // 1. TIME VALIDATION
  const targetDate = new Date(date);
  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);

  const targetDateStr = targetDate.toISOString().split("T")[0];
  const todayStr = istTime.toISOString().split("T")[0];

  if (targetDateStr < todayStr) {
    throw new ApiError(
      "Please Choose Another Slot , This Slot unavailable Now.",
      400,
    );
  }

  if (targetDateStr === todayStr) {
    const requestedMins = timeToMinutes(from);
    const currentMins = istTime.getHours() * 60 + istTime.getMinutes();
    if (requestedMins <= currentMins) {
      throw new ApiError(
        "Cannot book a slot in the past. Please select a future time.",
        400,
      );
    }
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const slotConflict = await Assignment.findOne({
    assignedTo: new mongoose.Types.ObjectId(consultantId),
    "schedule.date": { $gte: startOfDay, $lte: endOfDay },
    "schedule.from": from,
    status: { $ne: "rejected" },
  });

  if (slotConflict) {
    throw new ApiError(
      "This slot has already been booked. Please choose another slot.",
      409,
    );
  }

  const preAssignment = await Assignment.findOne({
    leadId: new mongoose.Types.ObjectId(leadId),
    phase: "pre",
    status: "completed",
  });

  if (!preAssignment) {
    throw new ApiError(
      "Cannot book Assessment. Pre-counselling is not completed yet.",
      400,
    );
  }

  const LeadModel = mongoose.models.Lead || mongoose.model("Lead");
  const currentLead = await LeadModel.findById(leadId).lean();
  const assessClearStatuses = ["assess_not_responded", "assess_scheduled", "assess_contacted", "assess_queued"];
   
  // Clear any existing assessment assignments and branch tokens if the lead is in certain statuses:-

  if (currentLead && assessClearStatuses.includes(currentLead.status)) {
    await Assignment.deleteMany({
      leadId: new mongoose.Types.ObjectId(leadId),
      phase: "assess"
    });

    const BranchTokenModel = mongoose.models.BranchToken || mongoose.model("BranchToken");
    const creatorId = currentLead.createdBy?.id || currentLead.createdBy?._id || currentLead.createdBy;
    if (creatorId && currentLead.preferences?.branchId) {
      await BranchTokenModel.deleteMany({
        userId: creatorId, 
        branchId: currentLead.preferences.branchId,
        status: { $in: ["generated", "queued"] }
      });
    }
  }

  
  const newAssessmentAssignment = await Assignment.findOneAndUpdate(
    { leadId: new mongoose.Types.ObjectId(leadId), phase: "assess" },
    {
      $set: {
        assignedTo: new mongoose.Types.ObjectId(consultantId),
        status: "assigned",
        schedule: {
          date: new Date(date),
          from,
          to,
          method: method || "off",
        },
        attended: false,
        token: { generated: false, number: null }
      }
    },
    { new: true, upsert: true }
  );

  await LeadModel.findByIdAndUpdate(leadId, {
    status: "assess_scheduled"
  });

  return newAssessmentAssignment;
};

export const getPreCounsellingBooking = async (leadId: string) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Invalid Lead ID", 400);
  }

  const AssignmentModel =
    mongoose.models.Assignment || mongoose.model("Assignment");

  const existingBooking = await AssignmentModel.findOne({
    leadId: new mongoose.Types.ObjectId(leadId),
    phase: "pre",
    status: { $ne: "rejected" },
  }).lean();

  return existingBooking;
};
