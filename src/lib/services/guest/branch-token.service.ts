import { ApiError } from "@/lib/error/api.error";
import { Assignment, IAssignment } from "@/lib/models/Assignment.model";
import { BranchTokenModel, IBranchToken } from "@/lib/models/BranchToken.model";
import { ILead, Lead } from "@/lib/models/Lead.model";
import User, { IUser } from "@/lib/models/User.model";
import mongoose from "mongoose";

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
    );

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
    console.log(lead, assignment, tokenRes, 25844);

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