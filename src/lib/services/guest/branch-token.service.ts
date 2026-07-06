import { ApiError } from "@/lib/error/api.error";
import { Assignment, IAssignment } from "@/lib/models/Assignment.model";
import { BranchTokenModel, IBranchToken } from "@/lib/models/BranchToken.model";
import { ILead, Lead } from "@/lib/models/Lead.model";
import User, { IUser } from "@/lib/models/User.model";
import "@/lib/models/Position.model";
import mongoose from "mongoose";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { tokenCounter } from "@/Types/ApiResponse/tokenRes.types";

export const createToken = async (body: any) => {
    const {
        identity
    } = body;
    const isPhone = /^[0-9]{10}$/.test(identity);
    let tokenRes: Partial<IBranchToken> = {};

    const user: IUser | null = await User.findOne(
        isPhone
            ? { phoneNumber: identity }
            : { email: identity.toLowerCase().trim() },
    ).select('-password');

    if (!user) {
        throw new ApiError('Phone number or email not registered', 401);
    }

    const lead: ILead | null = await Lead.findOne(
        isPhone
            ? {
                $or: [
                    { "contact.phone": identity },
                    { "contact.whatsapp": identity },
                ],
            }
            : {
                "contact.email": identity.toLowerCase().trim(),
            }
    )
    // .populate(
    //     "documents.actionBy",
    //     "role"
    // );
    // .populate({
    //     path: "documents.actionBy",
    //     select: "role", // select only required fields
    // }).lean();
    // console.log(lead,15164); return;

    if (!lead) {
        if (!user) {
            throw new ApiError('Phone number or email not registered', 401);
        }
        throw new ApiError(user.role !== "user" ? `You are not eligible to access!` : 'Inquiry has not been submitted yet. \nPlease complete and submit the inquiry details before proceeding.', 401);

    }

    const assignment: IAssignment | null = await Assignment.findOne({
        leadId: lead?._id,
        phase: { $in: ["assess", "pre"] },
    })
        .sort({ createdAt: -1 })
        .lean();
    if (lead && assignment) {
        // will update later

        // offline candidate come to branch after pre-counselling / assessment
        if (assignment?.phase === "pre" || assignment?.phase === "assess") {
            if (lead?.status === "pre_scheduled") {
                tokenRes = await generateBranchToken(lead?.preferences?.branchId, user?._id, lead?.preferences?.consultantId, assignment);
            }
            else if (lead?.status === "assess_scheduled") {
                tokenRes = await generateBranchToken(lead?.preferences?.branchId, user?._id, lead?.preferences?.consultantId, assignment);
            }
            else if (lead?.status === "doc_verified" && lead?.documents?.status === "verified" && assignment.phase == "assess" && assignment.status == "assigned" && lead?.documents?.actionBy && assignment.token?.generated === false) {

                const docActionBy = await Lead.findById(lead?._id)
                    .populate(
                        {
                            path: "documents.actionBy",
                            select: "role",
                        }
                    )
                    .lean();
                // console.log(docActionBy, 5844);

                //actionBy
                if (docActionBy?.documents?.actionBy?.role === "tac_head")
                    tokenRes = await generateBranchToken(lead?.preferences?.branchId, user?._id, lead?.preferences?.consultantId, assignment);
            }
            else if (lead?.status === "exp_verified" && lead?.technical?.status === "passed" && assignment.phase == "assess" && assignment.status == "assigned" && lead?.documents?.actionBy && assignment.token?.generated === false) {

                const expActionBy = await Lead.findById(lead?._id)
                    .populate(
                        {
                            path: "experience.actionBy",
                            select: "role",
                        })
                    .lean();
                // console.log(expActionBy?.experience?.actionBy?.role, 32332);
                if (expActionBy?.experience?.actionBy?.role === "tac_head")
                    tokenRes = await generateBranchToken(lead?.preferences?.branchId, user?._id, lead?.preferences?.consultantId, assignment);
            }
            else {
                throw new ApiError(`You are not eligible for generating token!`, 401);
            }

        }
        else {
            throw new ApiError(`Your next step doesn't support for token`, 401);

        }

    }
    else if (lead && !assignment) {
        // offline candidate come to branch after inquiry but not assigned to anyone
        throw new ApiError(`You are not currently assigned to any consultant. \n Please contact the receptionist for consultant assignment before generating a token`, 401);

    }
    else {
        throw new ApiError('Inquiry not submitted yet', 401);
    }
    // console.log(lead, assignment, tokenRes, 25844);

    return { token: tokenRes?.tokenNo, slot: { from: assignment?.schedule?.from, to: assignment?.schedule?.to }, role: user?.role };
};


// const generateBranchToken = async (branchId: any, userId: any, assignedId: any, lead:object) => {
// console.log(branchId, userId, assignedId, lead, 2944)
// first check the branch tokens 
// if having any token 
//  its from current date +1
//  its from last day 001
// if not having any token
//  it will create A for assignedId?.role==tac, A001
//  it will create C for assignedId?.role==coordinator, C001
// }
export const generateBranchToken = async (
    branchId: mongoose.Types.ObjectId | undefined,
    userId: mongoose.Types.ObjectId,
    assignedId: mongoose.Types.ObjectId | undefined,
    assignment: any
) => {
    // Get assigned user to determine token prefix
    const assignedUser = await User.findById(assignedId)
        .select("role")
        .lean();

    if (!assignedUser) {
        throw new ApiError('Assigned user not found', 401);
    }

    const prefix =
        assignedUser.role === "tac"
            ? "A"
            : assignedUser.role === "coordinator"
                ? "C"
                : "T";

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const scheduleDate = new Date(assignment?.schedule?.date);

    if (scheduleDate < startOfDay || scheduleDate > endOfDay) {
        throw new ApiError('Scheduled date is not valid for today.', 401);
    }
    // Find latest token generated today for this branch & prefix
    const lastToken: IBranchToken = await BranchTokenModel.findOne({
        branchId,
        tokenNo: { $regex: `^${prefix}` },
        generateDate: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
    })
        .sort({ createdAt: -1 })
        .lean();

    let nextNumber = 1;

    if (lastToken) {
        const currentNo = parseInt(
            lastToken.tokenNo.replace(prefix, ""),
            10
        );

        nextNumber = currentNo + 1;
    }

    // Check if branch has old tokens
    const oldToken = await BranchTokenModel.findOne({
        branchId,
        generateDate: { $lt: startOfDay },
    }).lean();
    // console.log(startOfDay, oldToken, 1351651);

    if (oldToken) {

        // Reset assignments
        await Assignment.updateMany(
            {
                "token.generated": true,
            },
            {
                $set: {
                    "token.generated": false,
                },
                $unset: {
                    "token.number": "",
                },
            }
        );

        await BranchTokenModel.deleteMany({
            branchId,
            generateDate: { $lt: startOfDay },
        });

        nextNumber = 1;
    }
    else {
        if (assignment?.token?.generated === true) {
            // const lastGeneratedtoken = await BranchTokenModel.findOne({
            //     branchId,
            //     userId,
            // }).lean();
            // ,lastGeneratedtoken
            throw new ApiError('Token already generated', 401);
        }
    }

    const tokenNo = `${prefix}${String(nextNumber).padStart(3, "0")}`;

    const token = await BranchTokenModel.create({
        tokenNo,
        branchId,
        userId,
        generatedBy: "user",
    });

    await Assignment.findByIdAndUpdate(assignment?._id, { "token.generated": true, "token.number": tokenNo })

    return token;
};

export const tokenCounterList = async ({ branchId }: { branchId: string }) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const counters = await EmployeeBranchShiftModel.aggregate([
            {
                $match: {
                    branchId: new mongoose.Types.ObjectId(branchId),
                    effectiveFrom: { $lte: today },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "employeeId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $match: {
                                role: "tac",
                                status: "active",
                            },
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                role: 1
                            },
                        },
                    ],
                    as: "employee",
                },
            },
            {
                $unwind: "$employee",
            },
            {
                $project: {
                    _id: 0,
                    counterNo: 1,
                    employeeId: "$employee._id",
                    employee: {
                        $concat: [
                            "$employee.firstName",
                            " ",
                            "$employee.lastName",
                        ]
                    },
                    role: "$employee.role"
                },
            },
            {
                $sort: {
                    effectiveFrom: -1,
                },
            },
            {
                $group: {
                    _id: "$employeeId", // or "$counterNo" depending on your requirement
                    doc: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$doc",
                },
            },
            {
                $sort: {
                    counterNo: 1,
                },
            }
        ]);

        if (!counters || counters.length === 0) {
            return [];
        }
        return counters;
    } catch (error: unknown) {
        if (error instanceof ApiError)
            throw error;
        throw new ApiError("Internal Server Error", 500);
    }
}


export const counterWiseTokens = async ({
    branchId,
    counters,
}: {
    branchId: string;
    counters: tokenCounter[];
}) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const employeeIds = counters.map(
            (c) => new mongoose.Types.ObjectId(c.employeeId)
        );

        const assignments = await Assignment.aggregate([
            {
                $match: {
                    assignedTo: { $in: employeeIds },
                    "token.generated": true,
                    status: "queued",
                    "schedule.date": {
                        $gte: today,
                        $lt: tomorrow,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    assignedTo: 1,
                    tokenNumber: "$token.number",
                    leadId: 1,
                },
            },
        ]);

        const tokenMap = new Map(
            assignments.map((a) => [
                a.assignedTo.toString(),
                {
                    tokenNumber: a.tokenNumber,
                    leadId: a.leadId,
                },
            ])
        );

        return counters.map((counter) => ({
            ...counter,
            currentToken:
                tokenMap.get(counter.employeeId)?.tokenNumber ?? null,
            leadId:
                tokenMap.get(counter.employeeId)?.leadId ?? null,
        }));
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Internal Server Error", 500);
    }
};