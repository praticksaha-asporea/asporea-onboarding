import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { JourneyData } from "@/Types/Frontend_Payload/tracking.types";

export const useApplicationTracking = () => {
  const router = useRouter();
  const reduxUser = useSelector((state: any) => state.userSlice?.userData || state.user?.userData);
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [isReduxReady, setIsReduxReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!leadId) return;
      try {
        setLoading(true);
        const res = await getJourneyTimelineAction(leadId);
        //  console.log("Journey Timeline Response:", res);  
         
        if (res?.success && res.data) {
          setJourneyData(res.data);
        } else {
          toast.error(res?.message || "Failed to fetch application timeline", { id: "journey-error" });
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, [leadId]);

  return { router, leadId, isPopupOpen, setIsPopupOpen, loading, journeyData, isReduxReady };
};