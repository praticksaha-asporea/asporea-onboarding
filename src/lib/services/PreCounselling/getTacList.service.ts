import mongoose from "mongoose";
import User from "@/lib/models/User.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { ApiError } from "@/lib/error/api.error";
import "@/lib/models/Upload.model";
import "@/lib/models/Branch.model";
import "@/lib/models/Shift.model";
interface GetTacListParams {
    page?: number;
    limit?: number;
    search?: string;
    branchId?: string;
    mode?: "online" | "offline" | "both";
}

export const getTacListService = async ({
    page = 1,
    limit = 10,
    search = "",
    branchId,
    mode,
}: GetTacListParams) => {
    try {
        const skip = (page - 1) * limit;


        const matchConditions: any[] = [
            { role: "tac" },
            { status: "active" },
        ];


        if (mode) {
            if (mode === "both") {
                matchConditions.push({ "tacProfile.mode": "both" });
            } else {
                matchConditions.push({
                    "tacProfile.mode": { $in: [mode, "both"] },
                });
            }
        }

        if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
            const assignedTacIds = await EmployeeBranchShiftModel.distinct(
                "employeeId",
                { branchId: new mongoose.Types.ObjectId(branchId) }
            );

            matchConditions.push({
                _id: { $in: assignedTacIds },
            });
        }


        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            matchConditions.push({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { "tacProfile.designation": regex },
                    { "tacProfile.specialization": regex },
                    { "tacProfile.areasOfExp": regex },
                ],
            });
        }

        const matchQuery = { $and: matchConditions };

        const totalRecords = await User.countDocuments(matchQuery);


        const tacUsers = await User.find(matchQuery)
            .select(
                "firstName lastName email phoneNumber whatsappNumber address bio experienceInMonths profilePic tacProfile status createdAt"
            )
            .populate("profilePic", "path")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const tacIds = tacUsers.map((tac) => tac._id);


        const branchShifts = await EmployeeBranchShiftModel.find({
            employeeId: { $in: tacIds },
        })
            .populate("branchId", "title location timeZone status")
            .populate("shiftId", "name startTime endTime")
            .select("employeeId branchId shiftId minuteOfSlots effectiveFrom")
            .sort({ effectiveFrom: -1 })
            .lean();

        const now = new Date();


        const formattedTacList = tacUsers.map((tac: any) => {
            const userShifts = branchShifts.filter(
                (shift: any) => shift.employeeId.toString() === tac._id.toString()
            );


            const uniqueBranchesMap = new Map();
            userShifts.forEach((shift: any) => {
                if (shift.branchId && !uniqueBranchesMap.has(shift.branchId._id.toString())) {
                    uniqueBranchesMap.set(shift.branchId._id.toString(), shift.branchId);
                }
            });
            const branches = Array.from(uniqueBranchesMap.values());


            const activeShifts = userShifts.filter(
                (shift: any) => new Date(shift.effectiveFrom) <= now
            );


            const activeShiftRecord = activeShifts.length > 0 ? activeShifts[0] : (userShifts[0] || null);

            const activeShiftInfo = activeShiftRecord ? {
                shift: activeShiftRecord.shiftId || null,
                minuteOfSlots: activeShiftRecord.minuteOfSlots,
                effectiveFrom: activeShiftRecord.effectiveFrom,
            } : null;

            return {
                _id: tac._id,
                firstName: tac.firstName || "",
                lastName: tac.lastName || "",
                fullName: `${tac.firstName || ""} ${tac.lastName || ""}`.trim() || "N/A",
                email: tac.email,
                phoneNumber: tac.phoneNumber || "",
                whatsappNumber: tac.whatsappNumber || "",
                address: tac.address || "",
                bio: tac.bio || "",
                experienceInMonths: tac.experienceInMonths || 0,
                profilePic: tac.profilePic?.path || "",
                tacProfile: {
                    designation: tac.tacProfile?.designation || "",
                    areasOfExp: tac.tacProfile?.areasOfExp || [],
                    languagesKnown: tac.tacProfile?.languagesKnown || [],
                    industryExp: tac.tacProfile?.industryExp || [],
                    specialization: tac.tacProfile?.specialization || [],
                    mode: tac.tacProfile?.mode || "both",
                },
                branches,
                currentShift: activeShiftInfo,
            };
        });

        return {
            tacList: formattedTacList,
            meta: {
                totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
            },
        };
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            error?.message || "Failed to fetch TAC list",
            500
        );
    }
};