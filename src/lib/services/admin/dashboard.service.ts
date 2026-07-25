import { BranchModel } from "@/lib/models/Branch.model";
import { ExternalSourceModel } from "@/lib/models/ExternalSource.model";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import { Lead } from "@/lib/models/Lead.model";
import { Position } from "@/lib/models/Position.model";
import User from "@/lib/models/User.model";
import { AxiosResponse } from "axios";
interface DashboardStatCard {
    label: string;
    value: string;
    delta?: string;
    trend?: "up" | "down";
    sub?: string;
}

interface RoleBreakdown {
    name: string;
    value: number;
}

interface InquiryByBranch {
    branch: string;
    inquiries: number;
}

interface RecentUpload {
    name: string;
    role: string;
    date: string;
}

interface ExternalSource {
    name: string;
    type: string;
    status: string;
}

interface Timeline {
    label: string;
    hours: number;
}

interface BranchStatus {
    name: string;
    location: string;
    counters: number;
    status: "ACTIVE" | "INACTIVE";
}

export interface DashboardResponse {
    statCards: DashboardStatCard[];
    roleBreakdown: RoleBreakdown[];
    inquiriesByBranch: InquiryByBranch[];
    recentUploads: RecentUpload[];
    externalSources: ExternalSource[];
    timelines: Timeline[];
    branchStatus: BranchStatus[];
}
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

export const dashboardItemsList = async () => {
    try {
        const [
            totalUsers, registeredThisWeek, roleBreakdown,
            branches,
            leads,
            inquiriesByBranch,
            positions,
            generalSetting,
            externalSources
        ] = await Promise.all([
            User.countDocuments({ status: { $ne: "deleted" } }),

            User.countDocuments({
                status: { $ne: "deleted" },
                createdAt: { $gte: weekAgo },
            }),

            User.aggregate([
                {
                    $match: {
                        status: { $ne: "deleted" },
                    },
                },
                {
                    $group: {
                        _id: { $toLower: "$role" },
                        value: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        value: 1,
                    },
                },
                {
                    $sort: { value: -1 },
                },
            ]),
            BranchModel.find().select("title timeZone counters status").lean(),
            Lead.countDocuments(),
            Lead.aggregate([
                {
                    $lookup: {
                        from: "branches",
                        localField: "preferences.branchId",
                        foreignField: "_id",
                        as: "branch",
                    },
                },
                {
                    $unwind: "$branch",
                },
                {
                    $group: {
                        _id: "$branch.title",
                        inquiries: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        branch: "$_id",
                        inquiries: 1,
                    },
                },
                {
                    $sort: { branch: 1 },
                },
            ]),
            Position.find().select('status mandatoryDocuments').lean(),
            GeneralSettingModel.findOne().lean(),
            ExternalSourceModel.find()
                .select("type status name createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        // Build dashboard data...

        const dashboard = {
            totalUsers, registeredThisWeek, roleBreakdown,
            branches,
            leads,
            inquiriesByBranch,
            positions,
            generalSetting,
            externalSources
        };

        return {
            success: true,
            message: "Dashboard fetched successfully.",
            data: dashboard,
        };
    } catch (error) {
        throw error;
    }
};
