import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; 
import { getTacScheduleAction,getFoeScheduleAction } from "@/Services/APIs/tac/tac.actions";

export interface ScheduleMeeting {
  id: string;
  title: string;
  candidateName: string;
  inqNo: string;
  profilePic: string;
  phone: string;
  date: string;  
  startTime: string;  
  endTime: string;    
  type: string;
  method: "on" | "off";
  phase: string;
  startMinutes: number;  
  endMinutes: number;
  tacName?: string; 
  tacId?: string;
  tacPic?: string;

}

 
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hrs = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hrs < 12) hrs += 12;
  if (period === "AM" && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

export const useSchedules = (currentMonthDate: Date) => {
  const [schedules, setSchedules] = useState<ScheduleMeeting[]>([]);
  const [loading, setLoading] = useState(false);
const currentUser = useSelector((state: any) => state.userSlice?.userData || state.user?.userData);
const isFoe = currentUser?.role === "foe" || currentUser?.user?.role === "foe";
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth() + 1;

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
       const res = isFoe 
          ? await getFoeScheduleAction({ month, year }) 
          : await getTacScheduleAction({ month, year });
        if (res.data?.success) {
          const formatted: ScheduleMeeting[] = res.data.data.map((item: any) => {
            const dateObj = new Date(item.schedule.date);
            const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

            const lead = item.leadId || {};
            const phaseName = item.phase === "pre" ? "Pre-Counselling" : item.phase === "assess" ? "Assessment" : "Appointment";
const tacFullName = item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}`.trim() : "Unknown TAC";
const tacPicPath = item.assignedTo?.profilePic?.path || item.assignedTo?.profilePic?.url || "";
            return {
              id: item._id,
              title: `${phaseName} - ${lead.fullName || "Candidate"}`,
              candidateName: lead.fullName || "Unknown",
              inqNo: lead.inqNo || "—",
              profilePic: lead.profilePic || "",
              phone: lead.contact?.whatsapp || lead.contact?.phone || "",
              date: dateStr,
              startTime: item.schedule?.from || "12:00 AM",
              endTime: item.schedule?.to || "12:00 AM",
              type: item.schedule?.method === "on" ? "live" : "counselling",
              method: item.schedule?.method || "off",
              phase: phaseName,
              startMinutes: timeToMinutes(item.schedule?.from),
              endMinutes: timeToMinutes(item.schedule?.to),
              tacName: isFoe ? tacFullName : undefined,  
              tacId: isFoe ? item.assignedTo?._id : undefined,
              tacPic: isFoe ? tacPicPath : undefined,  
            };
          });

          setSchedules(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [month, year]);

  return { schedules, loading };
};