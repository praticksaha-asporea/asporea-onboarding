import mongoose from "mongoose";
import User from "@/lib/models/User.model";
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import { sendOtpService } from "@/lib/services/auth/sendOtp";
import { verifyOtpService } from "@/lib/services/auth/verifyOtp";
import { generateInquiryNo } from "@/Utils/generateInquiryNo";
import { currentFy } from "@/Utils/common";
import { FoeInquiryPayload, FoeSendOtpPayload } from "../../../Types/foe.types";


export const foeSendCandidateOtpService = async (payload: FoeSendOtpPayload) => {
    const { identity, email, phone, whatsapp } = payload;

    const normalizedPhone = phone.trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedWhatsapp = whatsapp.trim();


    const existingUser = await User.findOne({
        $or: [
            { email: normalizedEmail },
            { phoneNumber: normalizedPhone },
            { whatsappNumber: normalizedWhatsapp },
        ],
    }).lean();

    if (existingUser) {
        const existingLead = await Lead.findOne({
            $or: [
                { "contact.phone": normalizedPhone },
                { "contact.email": normalizedEmail },
                { "createdBy.id": existingUser._id },
            ],
        }).lean();

        if (existingLead) {
            throw new ApiError("Candidate or Inquiry already exists with this Email/Phone", 400);
        }
    }


    return await sendOtpService(identity);
};


export const foeVerifyAndCreateCandidateService = async (
    body: FoeInquiryPayload,
    foeId: string
) => {
    const {
        phoneNumber,
        otp,
        fullName,
        email,
        whatsappNumber,
        passportStatus,
        passportNo,
        inquiryCategory,
        inquiryFor,
        nationality,
        latestAcademic,
        latestTechnical,
        workExperience,
        referedFrom,
        referedType,
        referedBy,
        otherReferedBy,
    } = body;

    const normalizedPhone = phoneNumber.trim();
    const normalizedEmail = email.toLowerCase().trim();
    await verifyOtpService(normalizedPhone, otp);


    const typeMapping: Record<string, string> = {
        "web-app": "web_app",
        call: "telecall",
        social: "social",
        reffer: "refer",
    };

    const refTypeMapping: Record<string, string> = {
        institution: "institute",
        pca: "pca",
        pcra: "pcra",
        other: "other",
    };


    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");


    let user = await User.findOne({
        $or: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }],
    });

    if (!user) {
        user = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            phoneNumber: normalizedPhone,
            whatsappNumber: whatsappNumber.trim(),
            role: "user",
            passportStatus,
            passportNo: passportStatus === "having" ? passportNo : "",
            enquired: "yes",
            candidateProfile: {
                nationality,
                academic: latestAcademic,
                technicalQualification: latestTechnical,
                workExp: workExperience,
            },
        });
    } else {
        user.passportStatus = passportStatus;
        if (passportStatus === "having" && passportNo) user.passportNo = passportNo;
        user.enquired = "yes";
        user.candidateProfile = {
            ...user.candidateProfile,
            nationality,
            academic: latestAcademic,
            technicalQualification: latestTechnical,
            workExp: workExperience,
        };
        await user.save();
    }


    const inqNo = await generateInquiryNo();
    const currentFYear = currentFy();

    const newLead = await Lead.create({
        fullName,
        contact: {
            phone: normalizedPhone,
            whatsapp: whatsappNumber.trim(),
            email: normalizedEmail,
        },
        inqForType: new mongoose.Types.ObjectId(inquiryCategory),
        inqForPosition: new mongoose.Types.ObjectId(inquiryFor),
        status: "inquiry_submitted",
        inqNo,
        inqFy: currentFYear,
        createdBy: {
            id: new mongoose.Types.ObjectId(foeId),
            type: "foe",
        },
        source: {
            type: typeMapping[referedFrom] || "none",
            refType: referedFrom === "reffer" ? refTypeMapping[referedType || ""] || "other" : undefined,
            refName:
                referedFrom === "reffer"
                    ? referedType === "other"
                        ? otherReferedBy
                        : referedBy
                    : undefined,
        },
        inquiryStages: { stage1: "done", stage2: "done", stage3: "pending" },
        documents: { status: "na" },
        passport: {
            status: passportStatus,
            no: passportStatus === "having" ? passportNo : undefined,
        },
    });


    if (!user.candidateProfile) {
        user.candidateProfile = {};
    }

    user.candidateProfile.leadId = newLead._id as mongoose.Types.ObjectId;
    await user.save();

    return newLead;
};