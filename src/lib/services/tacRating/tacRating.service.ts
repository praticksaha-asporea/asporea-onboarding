import mongoose from "mongoose";
import { TacRating, ITacRating } from "@/lib/models/TacRating.model";
import { Assignment } from "@/lib/models/Assignment.model";
import { ApiError } from "@/lib/error/api.error";

export const createTacRatingService = async (
  leadId: string,
  phase: string,
  rating: number,
  review: string,
  ratedBy: string,
  userRole: string 
) => {

    if (userRole?.toLowerCase() !== "user") {
    throw new ApiError(
      "Unauthorized access. Only candidate users are allowed to submit ratings.",
      403
    );
  }
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid Lead ID is required", 400);
  }
  if (!phase || typeof phase !== "string") {
    throw new ApiError("Valid phase is required", 400);
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError("Rating must be a number between 1 and 5", 400);
  }

  // 1. Assignment table mein is specific phase ka record check karo
  const assignment = await Assignment.findOne({
    leadId: new mongoose.Types.ObjectId(leadId),
    phase,
  });

  if (!assignment) {
    throw new ApiError(`No assignment found for phase '${phase}'`, 404);
  }

  // 2. Phase completion check (TL Requirement)
  if (assignment.status !== "completed") {
    throw new ApiError(
      `Rating can only be submitted after the '${phase}' phase is completed`,
      400
    );
  }

  if (!assignment.assignedTo) {
    throw new ApiError(`No TAC was assigned to the '${phase}' phase`, 400);
  }

  // 3. Duplicate rating check for this specific phase
  const existingRating = await TacRating.findOne({
    leadId: new mongoose.Types.ObjectId(leadId),
    phase,
  });

  if (existingRating) {
    throw new ApiError(`You have already submitted a rating for the '${phase}' phase`, 400);
  }

  // 4. Create Rating: Assignment model se is phase ke TAC ki ID pick karo
  const newRating = await TacRating.create({
    leadId: new mongoose.Types.ObjectId(leadId),
    phase,
    tacId: assignment.assignedTo, // Auto-pick assigned TAC for this phase
    ratedBy: new mongoose.Types.ObjectId(ratedBy),
    rating,
    review: review?.trim() || "",
  });

  return await TacRating.findById(newRating._id)
    .populate("tacId", "firstName lastName email profilePic")
    .populate("ratedBy", "firstName lastName email");
};

export const getTacRatingsService = async (filters: {
  leadId?: string;
  tacId?: string;
  phase?: string;
}) => {
  const query: Record<string, any> = {};

  if (filters.leadId) {
    if (!mongoose.Types.ObjectId.isValid(filters.leadId)) {
      throw new ApiError("Invalid Lead ID", 400);
    }
    query.leadId = new mongoose.Types.ObjectId(filters.leadId);
  }

  if (filters.tacId) {
    if (!mongoose.Types.ObjectId.isValid(filters.tacId)) {
      throw new ApiError("Invalid TAC ID", 400);
    }
    query.tacId = new mongoose.Types.ObjectId(filters.tacId);
  }

  if (filters.phase) {
    query.phase = filters.phase;
  }

  const ratings = await TacRating.find(query)
    .populate("tacId", "firstName lastName email profilePic")
    .populate("ratedBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  // Calculate Average Rating
  let averageRating = 0;
  if (ratings.length > 0) {
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    averageRating = Number((sum / ratings.length).toFixed(1));
  }

  return {
    totalRatings: ratings.length,
    averageRating,
    ratings,
  };
};