import { ApiError } from "@/lib/error/api.error";
import { Lead } from "@/lib/models/Lead.model";

export const getDelayedPendingLeadsService = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const skip = (page - 1) * limit;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const matchQuery: any = {
      $or: [
        { "inquiryStages.stage1": "pending" },
        { "inquiryStages.stage2": "pending" },
        { "inquiryStages.stage3": "pending" },
      ],
      createdAt: { $lte: oneHourAgo },
    };

    if (search) {
      const regex = new RegExp(search, "i");
      matchQuery["$or"] = [
        ...(matchQuery["$or"] || []),
        { fullName: regex },
        { inqNo: regex },
        { "contact.phone": regex },
        { "contact.email": regex },
      ];
    }

    const totalRecords = await Lead.countDocuments(matchQuery);

    const delayedLeads = await Lead.find(matchQuery)
      .select("fullName contact inqNo profilePic inquiryStages createdAt updatedAt status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      delayedLeads,
      meta: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error?.message || "Failed to fetch delayed pending leads",
      500
    );
  }
};