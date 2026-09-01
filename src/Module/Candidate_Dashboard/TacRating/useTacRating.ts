import { useEffect, useState } from "react";
import { getcandidateLastAppointment, submitTacRatingAction } from "@/Services/APIs/tac/tac.actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { lastAssignmentData } from "@/Types/object.types";

export const useTacRating = () => {//leadId: string, phase: string
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [phase, setPhase] = useState<string>("");
  const [tacDetails, setTacDetails] = useState<lastAssignmentData | null>(null);
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.candidateProfile?.leadId;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      const payload = {
        leadId,
        phase,
        rating,
        review,
      };

      const res = await submitTacRatingAction(payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Feedback submitted successfully!");

        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const getTacDetails = async () => {

    const lastAppointment = await getcandidateLastAppointment(leadId);
    setTacDetails(lastAppointment?.data?.data);
    setPhase(lastAppointment?.data?.data?.phase)

  }

  useEffect(() => {
    getTacDetails();
  }, []);

  return {
    rating,
    setRating,
    hover,
    setHover,
    review,
    setReview,
    handleSubmit,
    loading,
    tacDetails
  };
};