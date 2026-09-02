import { ApiError } from "@/lib/error/api.error";
import { Lead } from "@/lib/models/Lead.model";

export const getDelayedPendingLeadsService = async (
    page = 1,
    limit = 10,
    search = "",
    stageFilter = "all"
) => {
    try {
        const skip = (page - 1) * limit;


        const delayHours = Number(process.env.FOLLOWUP_DELAY_HOURS || 1);
        const delayInMs = delayHours * 60 * 60 * 1000;
        const overdueThreshold = new Date(Date.now() - delayInMs);

        const matchConditions: any[] = [];

        if (stageFilter === "stage1") {
            matchConditions.push({
                "inquiryStages.stage1": "pending",
                createdAt: { $lte: overdueThreshold },
            });
        } else if (stageFilter === "stage2") {
            matchConditions.push({
                "inquiryStages.stage1": { $ne: "pending" },
                "inquiryStages.stage2": "pending",
                updatedAt: { $lte: overdueThreshold },
            });
        } else if (stageFilter === "stage3") {
            matchConditions.push({
                "inquiryStages.stage2": { $ne: "pending" },
                "inquiryStages.stage3": "pending",
                updatedAt: { $lte: overdueThreshold },
            });
        }
        else if (stageFilter === "followUpRequired") {
            matchConditions.push({
                "followUpRequired": true,
            });
        }

        else {

            matchConditions.push({
                $or: [
                    {
                        "inquiryStages.stage1": "pending",
                        createdAt: { $lte: overdueThreshold },
                    },
                    {
                        "inquiryStages.stage1": { $ne: "pending" },
                        "inquiryStages.stage2": "pending",
                        updatedAt: { $lte: overdueThreshold },
                    },
                    {
                        "inquiryStages.stage2": { $ne: "pending" },
                        "inquiryStages.stage3": "pending",
                        updatedAt: { $lte: overdueThreshold },
                    },
                ],
            });
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            matchConditions.push({
                $or: [
                    { fullName: regex },
                    { name: regex },
                    { "personalDetails.fullName": regex },
                    { inqNo: regex },
                    { "contact.phone": regex },
                    { "contact.whatsapp": regex },
                    { "contact.email": regex },
                ],
            });
        }

        const matchQuery = { $and: matchConditions };

        const totalRecords = await Lead.countDocuments(matchQuery);

        const rawLeads = await Lead.find(matchQuery)
            .select(
                "fullName name personalDetails contact inqNo profilePic inquiryStages createdAt updatedAt status"
            )
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const delayedLeads = rawLeads.map((lead: any) => ({
            _id: lead._id,
            name: lead.name || lead.fullName || lead.personalDetails?.fullName || "N/A",
            fullName: lead.fullName || lead.name || lead.personalDetails?.fullName || "N/A",
            inqNo: lead.inqNo || "—",
            profilePic: lead.profilePic || lead.personalDetails?.profilePic || "",
            contact: {
                phone: lead.contact?.phone || "",
                whatsapp: lead.contact?.whatsapp || lead.contact?.phone || "",
                email: lead.contact?.email || "",
            },
            inquiryStages: lead.inquiryStages || {},
            status: lead.status || "",
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
        }));

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