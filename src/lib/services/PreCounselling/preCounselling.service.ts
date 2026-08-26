import mongoose from "mongoose";
import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import "../../models/Lead.model";
import "../../models/ShiftSchedule.model";
import { Assignment } from "../../models/Assignment.model";
import { ApiError } from "../../error/api.error";
import { ILead, Lead } from "../../models/Lead.model";
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

type BookingMethod = "on" | "off";

interface SavePreCounsellingBookingBody {
  leadId?: string;
  branchId?: string;
  consultantId?: string;
  date?: string;
  from?: string;
  to?: string;
  method?: BookingMethod;
  initialCV?: string;
}

const PRE_CLEAR_STATUSES = [
  "pre_not_responded",
  "pre_scheduled",
  "pre_contacted",
  "pre_queued",
];

type PopulatedEmployee = {
  _id: mongoose.Types.ObjectId;
  role: string;
};

type TacShift = {
  employeeId: PopulatedEmployee | null;
  counterNo?: number | null;
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

export const savePreCounsellingBooking = async (
  body: SavePreCounsellingBookingBody,
) => {
  const {
    leadId,
    branchId,
    consultantId,
    date,
    from,
    to,
    method = "off",
    initialCV,
  } = body;

  const hasConsultant = Boolean(consultantId);

  // ------------------------------------------------------------
  // 1. Validate booking mode
  // ------------------------------------------------------------

  if (hasConsultant) {
    if (!date || !from || !to) {
      throw new ApiError(
        "Date and time slot are required when selecting a consultant.",
        400,
      );
    }
  } else {
    if (!leadId || !branchId) {
      throw new ApiError(
        "Lead and branch details are required for booking.",
        400,
      );
    }
  }

  // ------------------------------------------------------------
  // 2. Validate ObjectIds
  // ------------------------------------------------------------

  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Invalid lead ID.", 400);
  }

  if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
    throw new ApiError("Invalid branch ID.", 400);
  }

  if (
    consultantId &&
    !mongoose.Types.ObjectId.isValid(consultantId)
  ) {
    throw new ApiError("Invalid consultant ID.", 400);
  }

  const leadObjectId = new mongoose.Types.ObjectId(leadId);
  const branchObjectId = new mongoose.Types.ObjectId(branchId);

  const consultantObjectId = consultantId
    ? new mongoose.Types.ObjectId(consultantId)
    : null;

  const isOnline = method === "on";

  // ------------------------------------------------------------
  // 3. Get current lead
  // ------------------------------------------------------------

  const currentLead = await Lead.findById(leadObjectId).lean();

  if (!currentLead) {
    throw new ApiError("Lead not found.", 404);
  }

  // ------------------------------------------------------------
  // 4. Validate selected slot
  // ------------------------------------------------------------

  if (hasConsultant && date && from && to) {
    const targetDate = new Date(date);

    if (Number.isNaN(targetDate.getTime())) {
      throw new ApiError("Invalid booking date.", 400);
    }

    // Current IST time
    const now = new Date();

    const istNow = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    );

    const targetDateStr = targetDate.toISOString().split("T")[0];

    const todayStr = [
      istNow.getFullYear(),
      String(istNow.getMonth() + 1).padStart(2, "0"),
      String(istNow.getDate()).padStart(2, "0"),
    ].join("-");

    // Past date
    if (targetDateStr < todayStr) {
      throw new ApiError(
        "Please choose another slot. This slot is no longer available.",
        400,
      );
    }

    // Same-day past time
    if (targetDateStr === todayStr) {
      const requestedMinutes = timeToMinutes(from);

      if (requestedMinutes === null) {
        throw new ApiError("Invalid booking time.", 400);
      }

      const currentMinutes =
        istNow.getHours() * 60 + istNow.getMinutes();

      if (requestedMinutes <= currentMinutes) {
        throw new ApiError(
          "Cannot book a slot in the past. Please select a future time.",
          400,
        );
      }
    }

    // ----------------------------------------------------------
    // Check TAC slot conflict
    // ----------------------------------------------------------

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const slotConflict = await Assignment.exists({
      assignedTo: consultantObjectId,
      "schedule.date": {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      "schedule.from": from,
      status: {
        $ne: "rejected",
      },
    });

    if (slotConflict) {
      throw new ApiError(
        "This slot has already been booked. Please choose another slot.",
        409,
      );
    }
  }

  // ------------------------------------------------------------
  // 5. Clear previous pre-counselling assignment
  // ------------------------------------------------------------

  if (PRE_CLEAR_STATUSES.includes(currentLead.status)) {
    await Assignment.deleteMany({
      leadId: leadObjectId,
      phase: "pre",
    });

    const creatorId =
      currentLead.createdBy?.id ||
      currentLead.createdBy?._id ||
      currentLead.createdBy;

    if (
      creatorId &&
      currentLead.preferences?.branchId
    ) {
      await BranchTokenModel.deleteMany({
        userId: creatorId,
        branchId: currentLead.preferences.branchId,
        status: {
          $in: ["generated", "queued"],
        },
      });
    }
  }

  // ------------------------------------------------------------
  // 6. Resolve consultant
  // ------------------------------------------------------------

  let resolvedConsultantId: mongoose.Types.ObjectId | null =
    consultantObjectId;

  // Explicit consultant + slot
  if (consultantObjectId && date && from && to) {
    resolvedConsultantId = consultantObjectId;
  }

  // ------------------------------------------------------------
  // 7. Auto assign TAC for online booking
  // ------------------------------------------------------------

  if (isOnline && !resolvedConsultantId) {
    const [generalSettings, branch] = await Promise.all([
      GeneralSettingModel.findOne().lean(),
      BranchModel.findById(branchObjectId).lean(),
    ]);

    if (!branch) {
      throw new ApiError("Selected branch not found.", 404);
    }

    // const tacShifts = await EmployeeBranchShiftModel.find({
    //   branchId: branchObjectId,
    // })
    //   .populate<{
    //     employeeId: {
    //       _id: mongoose.Types.ObjectId;
    //       role: string;
    //     };
    //   }>("employeeId", "role")
    //   .lean();
    const tacShifts = await EmployeeBranchShiftModel.find({
      branchId: branchObjectId,
    })
      .populate("employeeId", "_id role")
      .lean() as unknown as TacShift[];

    // ----------------------------------------------------------
    // Extract TACs
    // ----------------------------------------------------------

    const validTacShifts = tacShifts.filter(
      (shift): shift is TacShift & {
        employeeId: PopulatedEmployee;
        counterNo: number;
      } =>
        shift.employeeId !== null &&
        shift.employeeId.role === "tac" &&
        shift.counterNo != null,
    );

    const tacEntries = Array.from(
      new Map(
        validTacShifts.map((shift) => [
          shift.employeeId._id.toString(),
          {
            employeeId: shift.employeeId._id,
            counterNo: shift.counterNo,
          },
        ]),
      ).values(),
    );

    if (tacEntries.length > 0) {
      const assignmentType =
        generalSettings?.tacAssignmentType ?? "random";

      const lastUsedCounter = branch.lastUsedCounter ?? 0;

      // --------------------------------------------------------
      // Prevent immediate same TAC when possible
      // --------------------------------------------------------

      const eligibleEntries =
        tacEntries.length > 1
          ? tacEntries.filter(
            (entry) => entry.counterNo !== lastUsedCounter,
          )
          : tacEntries;

      const availableEntries =
        eligibleEntries.length > 0
          ? eligibleEntries
          : tacEntries;

      let selectedTac: (typeof tacEntries)[number] | undefined;
      if (assignmentType === "random") {
        selectedTac =
          availableEntries[
          Math.floor(Math.random() * availableEntries.length)
          ];
      } else {
        // Counterwise / round-robin
        const sortedEntries = [...tacEntries].sort(
          (a, b) => a.counterNo - b.counterNo,
        );

        const lastIndex = sortedEntries.findIndex(
          (entry) =>
            entry.counterNo === lastUsedCounter,
        );

        const nextIndex =
          lastIndex === -1
            ? 0
            : (lastIndex + 1) %
            sortedEntries.length;

        selectedTac = sortedEntries[nextIndex];
      }

      if (selectedTac) {
        resolvedConsultantId = selectedTac.employeeId;

        await BranchModel.findByIdAndUpdate(
          branchObjectId,
          {
            lastUsedCounter: selectedTac.counterNo,
          },
        );
      }
    }
  }

  // ------------------------------------------------------------
  // 8. Create / update assignment
  // ------------------------------------------------------------

  if (
    resolvedConsultantId &&
    date &&
    from &&
    to
  ) {
    await Assignment.findOneAndUpdate(
      {
        leadId: leadObjectId,
        phase: "pre",
      },
      {
        $set: {
          assignedTo: resolvedConsultantId,

          schedule: {
            date: new Date(date),
            from,
            to,
            method,
          },

          status: "assigned",
          attended: false,

          token: {
            generated: false,
            number: null,
          },
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
  }

  // ------------------------------------------------------------
  // 9. Update lead
  // ------------------------------------------------------------

  const leadUpdate: Record<string, any> = {
    status: "pre_scheduled",
    "preferences.branchId": branchObjectId,
    "inquiryStages.stage3": "done",
  };

  if (resolvedConsultantId) {
    leadUpdate["preferences.consultantId"] =
      resolvedConsultantId;
  }

  if (initialCV) {
    leadUpdate.candidateResume = initialCV;
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    leadObjectId,
    {
      $set: leadUpdate,
    },
    {
      new: true,
    },
  );

  return updatedLead;
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