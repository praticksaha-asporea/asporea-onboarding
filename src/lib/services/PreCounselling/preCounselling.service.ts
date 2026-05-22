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

  return (hours * 60) + (minutes || 0);
};

 
const formatTime12Hr = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  const formattedMin = m.toString().padStart(2, "0");
  return `${formattedHour.toString().padStart(2, "0")}:${formattedMin} ${ampm}`;
};

export const getConsultantSlots = async (consultantId: string, targetDateStr: string) => {
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
 
  const shiftAssignments = await EmployeeBranchShiftModel.find({
    employeeId: new mongoose.Types.ObjectId(consultantId),
  });

  if (!shiftAssignments || shiftAssignments.length === 0) {
    return [];  
  }

  const shiftIds = shiftAssignments.map((a) => a.shiftId);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const targetDay = daysOfWeek[targetDate.getDay()];
 
  const ShiftScheduleModel = mongoose.models.ShiftSchedule || mongoose.model("ShiftSchedule");
  const schedule = await ShiftScheduleModel.findOne({ 
    shiftId: { $in: shiftIds },
    days: targetDay 
  });
  
  if (!schedule) {
    return [];  
  }

  
  const activeAssignment = shiftAssignments.find(
    (a) => a.shiftId.toString() === schedule.shiftId.toString()
  );

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

  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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
 
    if (isToday && currentMins <= currentMinutes) {
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

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const slotConflict = await Assignment.findOne({
    assignedTo: new mongoose.Types.ObjectId(consultantId),  
    "schedule.date": { $gte: startOfDay, $lte: endOfDay },
    "schedule.from": from,
    status: { $ne: "rejected" }
  });

  if (slotConflict) {
    throw new ApiError("This slot has already been booked. Please choose another slot.", 409);
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
          method: method || "off" 
        },
        status: "assigned",
        attended: false
      }
    },
    { new: true, upsert: true } 
  );

  return updatedAssignment;
};