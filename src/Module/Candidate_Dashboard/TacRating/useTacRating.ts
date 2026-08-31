import { useState } from "react";
import { submitTacRatingAction } from "@/Services/APIs/tac/tac.actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";  

export const useTacRating = (leadId: string, phase: string) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
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

  return {
    rating,
    setRating,
    hover,
    setHover,
    review,
    setReview,
    handleSubmit,
    loading,  
  };
};