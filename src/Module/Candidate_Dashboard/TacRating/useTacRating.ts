import { useState } from "react";

export const useTacRating = () => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Static Submit Data: ", { rating, review });
    // API call will go here later
  };

  return {
    rating,
    setRating,
    hover,
    setHover,
    review,
    setReview,
    handleSubmit,
  };
};