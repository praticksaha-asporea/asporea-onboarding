import mongoose from "mongoose";
import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import "../../models/Lead.model";
import "../../models/ShiftSchedule.model";
import { Assignment } from "../../models/Assignment.model";
import { ApiError } from "../../error/api.error";
import { Lead } from "../../models/Lead.model";
import User from "@/lib/models/User.model";
import { BranchTokenModel } from "@/lib/models/BranchToken.model";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import { BranchModel } from "@/lib/models/Branch.model";

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
  const { leadId, branchId, consultantId, date, from, to, method, initialCV } = body;

  if (
    (consultantId && (!date || !from || !to)) ||
    (!consultantId && (!leadId || !branchId))
  ) {
    throw new ApiError("Missing required fields for booking", 400);
  }

  const isOnline = Number(method) === 2;

  // ── Resolve which TAC (consultantId) to assign ──────────────────────────────
  let resolvedConsultantId: mongoose.Types.ObjectId | null = null;
  const prefferedBranch = new mongoose.Types.ObjectId(branchId);
  const prefferedConsultant = new mongoose.Types.ObjectId(consultantId);
  if (date) {
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
  }

  const currentLead = await Lead.findById(leadId).lean();

  // Clear any existing pre-counselling assignments and branch tokens if the lead is in certain statuses
  const preClearStatuses = ["pre_not_responded", "pre_scheduled", "pre_contacted", "pre_queued"];
  if (currentLead && preClearStatuses.includes(currentLead.status)) {
    await Assignment.deleteMany({
      leadId: new mongoose.Types.ObjectId(leadId),
      phase: "pre"
    });


    const creatorId = currentLead.createdBy?.id || currentLead.createdBy?._id || currentLead.createdBy;
    if (creatorId && currentLead.preferences?.branchId) {
      await BranchTokenModel.deleteMany({
        userId: creatorId,
        branchId: currentLead.preferences.branchId,
        status: { $in: ["generated", "queued"] }
      });
    }
  }


  if (consultantId && date) {

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
          },
        },
      },
      { new: true, upsert: true },
    );
    if (updatedAssignment) {
      await Lead.findByIdAndUpdate(leadId, {
        status: "pre_scheduled",
        "preferences.consultantId": prefferedConsultant,
        "preferences.branchId": prefferedBranch,
        ...(initialCV && { candidateResume: initialCV }),
        "inquiryStages.stage3": "done"
      });
    }
    return updatedAssignment;
  }
  else {
    // if (prefferedConsultant) {
    //   // Consultant explicitly chosen — always honour it regardless of visit type
    //   resolvedConsultantId = new mongoose.Types.ObjectId(prefferedConsultant);
    // } else 
    if (isOnline && !prefferedConsultant) {
      // Online visit with no preferred consultant → auto-assign a TAC
      const [generalSettings, branch] = await Promise.all([
        GeneralSettingModel.findOne().lean(),
        BranchModel.findById(prefferedBranch).lean(),
      ]);

      if (!branch) {
        throw new ApiError("Selected branch not found", 404);
      }

      const tacShifts = await EmployeeBranchShiftModel.find({
        branchId: new mongoose.Types.ObjectId(prefferedBranch),
      })
        .populate<{ employeeId: { _id: mongoose.Types.ObjectId; role: string } }>(
          "employeeId",
          "role"
        )
        .lean();

      const rawTacEntries = tacShifts
        .filter((s: any) => s.employeeId && s.employeeId.role === "tac" && s.counterNo != null)
        .map((s: any) => ({
          employeeId: s.employeeId._id as mongoose.Types.ObjectId,
          counterNo: s.counterNo as number,
        }));

      const tacEntries = Array.from(
        new Map(rawTacEntries.map((e: any) => [e.employeeId.toString(), e])).values()
      );

      if (tacEntries.length > 0) {
        const assignmentType = generalSettings?.tacAssignmentType ?? "random";
        const lastUsedCounter: number = (branch as any).lastUsedCounter ?? 0;

        const eligibleEntries =
          tacEntries.length > 1
            ? tacEntries.filter((e) => e.counterNo !== lastUsedCounter)
            : tacEntries;

        if (assignmentType === "random") {
          // Pick a random TAC from the eligible pool
          const pick = eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];
          resolvedConsultantId = pick.employeeId;

          // Update branch lastUsedCounter to the chosen counter
          await BranchModel.findByIdAndUpdate(prefferedBranch, {
            lastUsedCounter: pick.counterNo,
          });
        } else {
          // counterwise — advance one step from lastUsedCounter (round-robin by index)
          // Sort entries by counterNo for deterministic ordering
          const sorted = [...tacEntries].sort((a, b) => a.counterNo - b.counterNo);
          const lastIdx = sorted.findIndex((e) => e.counterNo === lastUsedCounter);
          const nextIdx = lastIdx === -1 ? 0 : (lastIdx + 1) % sorted.length;
          const pick = sorted[nextIdx];
          resolvedConsultantId = pick.employeeId;

          // Persist the new lastUsedCounter on the branch
          await BranchModel.findByIdAndUpdate(prefferedBranch, {
            lastUsedCounter: pick.counterNo,
          });
        }
      }
    }
    return await Lead.findByIdAndUpdate(leadId, {
      status: "pre_scheduled",
      "preferences.branchId": prefferedBranch,
      "preferences.consultantId": resolvedConsultantId,
      ...(initialCV && { candidateResume: initialCV }),
      "inquiryStages.stage3": "done"
    });
  }


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


  if (newAssessmentAssignment) {
    await LeadModel.findByIdAndUpdate(leadId, {
      status: "assess_scheduled",
      "preferences.consultantId": new mongoose.Types.ObjectId(consultantId)
    });
  }
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


export const cancelPreBooking = async (bodyData: any) => {
  const { leadId, actionBy, cancelReason } = bodyData;

  const lead = await Lead.findById(leadId);
  const userExists = await User.findById(actionBy);

  if (!lead || !userExists) {
    throw new ApiError("Lead or User not found", 400);
  }

  //Later log will use


  await Assignment.deleteOne({
    leadId: new mongoose.Types.ObjectId(leadId),
    phase: "pre"
  });

  await BranchTokenModel.deleteMany({
    userId: new mongoose.Types.ObjectId(actionBy),
  });

  const updatedLead = await Lead.findByIdAndUpdate(leadId, {
    status: "inquiry_submitted",
    "inquiryStages.stage3": "pending",
    "source.type": actionBy
  });
  return updatedLead;
}