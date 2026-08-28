import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getSlotsAction,
  getTacsListAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import { preTACData } from "@/Types/object.types";

export type CounsellingMode = "online" | "offline";

export const useTacAndSlots = (
  selectedBranchId: string,
  mode: CounsellingMode,
  todayStr: string,
  existingBooking: any,
) => {
  const [tacs, setTacs] = useState<preTACData[]>([]);
  const [loadingTacs, setLoadingTacs] = useState(false);
  const [tacSearch, setTacSearch] = useState("");
  const [selectedTacId, setSelectedTacId] = useState<string>("");

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (existingBooking?.assignedTo) {
      const tacId =
        typeof existingBooking.assignedTo === "object"
          ? existingBooking.assignedTo._id
          : existingBooking.assignedTo;
      setSelectedTacId(tacId.toString());
    }
    if (existingBooking?.schedule?.from && existingBooking?.schedule?.to) {
      setSelectedSlot({
        from: existingBooking.schedule.from,
        to: existingBooking.schedule.to,
        time: `${existingBooking.schedule.from} - ${existingBooking.schedule.to}`,
        available: true,
      });
    }
  }, [existingBooking]);

  // Fetch TAC list
  useEffect(() => {
    const fetchTacs = async () => {
      if (!selectedBranchId) {
        setTacs([]);
        return;
      }
      setLoadingTacs(true);
      try {
        const payload = {
          page: 1,
          limit: 10,
          search: tacSearch,
          mode,
          branchId: selectedBranchId,
        };
        const res = await getTacsListAction(payload);
        const list = res?.data?.data?.tacList || [];
        setTacs(list);
      } catch (err) {
        console.error("TAC fetch error:", err);
        setTacs([]);
      } finally {
        setLoadingTacs(false);
      }
    };
    fetchTacs();
  }, [selectedBranchId, mode, tacSearch]);

  // Fetch Slots list
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedTacId) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await getSlotsAction({ consultantId: selectedTacId, date });
        if (res?.data?.success) setSlots(res?.data?.data);
        else {
          toast.error(res?.data?.message || "Failed to fetch slots");
          setSlots([]);
        }
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedTacId, date]);

  return {
    tacs,
    loadingTacs,
    tacSearch,
    setTacSearch,
    selectedTacId,
    setSelectedTacId,
    date,
    setDate,
    slots,
    loadingSlots,
    selectedSlot,
    setSelectedSlot,
  };
};
