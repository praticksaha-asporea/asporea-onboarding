import { Assignment } from "@/lib/models/Assignment.model";
import mongoose from "mongoose";
import { uploadFileService } from "@/lib/services/upload.service";
import { Lead } from "@/lib/models/Lead.model";
import { BranchTokenModel } from "@/lib/models/BranchToken.model";
import { AssessmentModel } from "@/lib/models/Assessment.model";
import User from "@/lib/models/User.model";
import { ApiError } from "@/lib/error/api.error";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";

export const AssessmentUpdate = async (value: any, authUser: any, files: any) => {
    const { id, passportNo, totalMarks, note1, note2, note3, note4 } = value;
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError("Invalid assignment ID", 400);

    // Verify the assignment belongs to this TAC
    const assignment = await Assignment.findOne({
        _id: id,
        assignedTo: new mongoose.Types.ObjectId(authUser.id),
    });
    if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);
    if (!assignment?.token?.number && assignment?.schedule?.method == "off") throw new ApiError("Token not generated yet", 404);
    // need to work on file upload
    type UploadResult = {
        uploadId: string;
        path: string;
    };

    let resultcandidateSign: UploadResult | null = null;
    let resultassessorSign: UploadResult | null = null;

    if (files?.candidateSign) {

        resultcandidateSign = await uploadFileService({
            file: files?.candidateSign,
            userId: authUser?.id,
        });
    }
    if (files?.assessorSign) {

        resultassessorSign = await uploadFileService({
            file: files?.assessorSign,
            userId: authUser?.id,
        });
    }
    const generalSettings= await GeneralSettingModel.findOne().lean();
    
    const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // need to work here for update fields
    const update: Record<string, any> = {
        leadId: assignment?.leadId,
        date: today,
        assessedBy: authUser?.id,
        ...(passportNo !== undefined && {
            passportNo,
        }),
        scores: {
            total: generalSettings?.assessment?.fullMarks,
            achieved: totalMarks
        },
        notes: [note1, note2, note3, note4].map((text) => ({
            text: text || "",
            createdAt: new Date(),
        })),
        ...(files && resultcandidateSign?.uploadId !== undefined && {
            candidateSign: resultcandidateSign.uploadId,
        }),
        ...(files && resultassessorSign?.uploadId !== undefined && {
            assessorSign: resultassessorSign.uploadId,
        }),
    };
    const status = totalMarks > generalSettings?.assessment?.passingMarks ? 'completed' : 'rejected';
    // console.log(update,status,2844);
    const assessmentUpdate = await AssessmentModel.findOneAndUpdate(
        { leadId: assignment?.leadId },
        { $set: update },
        {
            returnDocument: "after", runValidators: true,
            upsert: true,
        });
    if (assessmentUpdate) {
        const updated = await Assignment.findByIdAndUpdate(
            id,
            { $set: { 'status': status } },
            { returnDocument: "after", runValidators: true },
        ).lean();

        const updatableStatus: Record<string, string> = {
            completed: "assess_completed",
            rejected: "assess_rejected",
        };
        if (updatableStatus) {

            const statusUpdatedLead = await Lead.findByIdAndUpdate(
                assignment?.leadId,
                { $set: { status: updatableStatus?.[status] } },
                { returnDocument: "after", runValidators: true }
            );

            const getCandidateUser =
                statusUpdatedLead?.createdBy?.type === "self" &&
                    statusUpdatedLead?.createdBy?.id
                    ? await User.findById(statusUpdatedLead.createdBy.id)
                    : null;
            if (passportNo !== "") {
                if (statusUpdatedLead?.passport?.no === "" || statusUpdatedLead?.passport?.status === "no" || statusUpdatedLead?.passport?.status === "applied") {
                    await Lead.findByIdAndUpdate(
                        assignment?.leadId,
                        { $set: { 'passport.no': passportNo, 'passport.status': 'having' } },
                        { returnDocument: "after", runValidators: true }
                    );

                    if (getCandidateUser !== null) {
                        await User.findByIdAndUpdate(getCandidateUser?._id, { 'passportNo': passportNo, 'passportStatus': 'having' })
                    }
                }
            }
            if (updatableStatus?.[status] === "assess_completed") {
                // only work when offline - later
                if(updated?.token?.number!==null)
                    await BranchTokenModel.findOneAndUpdate(
                        { tokenNo: updated?.token?.number },
                        { $set: { status: 'finished' } },
                        { returnDocument: 'after', upsert: true, runValidators: true },
                    ).lean();
                //email/ notification for prescription wlll add later

            }
        }

        return updated;
    }
}

export const AssessmentExperienceVerification = async (value: any, authUser: any) => {

    const { id, status, expType } = value;

    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError("Invalid assignment ID", 400);

    // Verify the assignment belongs to this TAC
    const assignment = await Assignment.findOne({
        _id: id,
        assignedTo: new mongoose.Types.ObjectId(authUser.id),
    });
    if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);
    if (!assignment?.token?.number && assignment?.schedule?.method == "off") throw new ApiError("Token not generated yet", 404)

    let
        leadUpdate = { "experience.status": status, "experience.type": expType, status: `exp_${status}`, "experience.actionBy": new mongoose.Types.ObjectId(authUser.id) };

    const updatedLead = await Lead.findByIdAndUpdate(
        assignment?.leadId,
        {
            $set: {
                ...leadUpdate,
                ...(status === "request_technical" && {
                    "technical.status": 'refered',
                    "technical.required": true,
                }),
            },
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );
    // console.log(updatedLead,5844444);

    if (status === 'request_technical') {
        // Refer Technical
    }
    return updatedLead;

}


export const getAssessmentResult = async (leadId: string) => {
    const result = await AssessmentModel.findOne({
        leadId: new mongoose.Types.ObjectId(leadId),
    });
    if (!result) throw new ApiError("Assessment not found", 404);

    return result;

}



