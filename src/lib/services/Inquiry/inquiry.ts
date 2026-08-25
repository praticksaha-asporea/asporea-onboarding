import { Lead } from "../../models/Lead.model";
import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import UserModel from "../../models/User.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";
import { ExternalSourceModel } from "@/lib/models/ExternalSource.model";
import { BranchModel } from "../../models/Branch.model";
import { GeneralSettingModel } from "../../models/GeneralSetting.model";
import { generateInquiryNo } from "@/Utils/generateInquiryNo";
import { currentFy } from "@/Utils/common";
export const createInquiry = async (body: any, createdById: string) => {
  const {
    fullName,
    email,
    phoneNumber,
    whatsappNumber,
    inquiryCategory,
    inquiryFor,
    latitude,
    longitude,
  } = body;

 
  const radius = 50 * 1000;
  const branch = await BranchModel.findOne({
    coordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: radius,
      },
    },
  }).lean();

  if (!branch) {
    throw new ApiError("No branch found within 10km radius", 404);
  }
  const prefferedBranch = branch?._id;
 
  const existingInquiry = await Lead.findOne({
    $or: [
      { "contact.email": email.toLowerCase().trim() },
      { "contact.phone": phoneNumber.trim() },
    ],
  });

 
  if (existingInquiry) {
    const updatedInquiry = await Lead.findByIdAndUpdate(
      existingInquiry._id,
      {
        $set: {
          fullName,
          "contact.phone": phoneNumber.trim(),
          "contact.whatsapp": whatsappNumber ? whatsappNumber.trim() : phoneNumber.trim(),
          "contact.email": email.toLowerCase().trim(),
          "preferences.branchId": new mongoose.Types.ObjectId(prefferedBranch),
          inqForType: inquiryCategory,
          inqForPosition: inquiryFor,
        },
      },
      { new: true }
    );

     
    await UserModel.findByIdAndUpdate(createdById, {
      enquired: "yes",
      $set: {
        "candidateProfile.leadId": new mongoose.Types.ObjectId(existingInquiry._id),
      },
    });

    return updatedInquiry;
  }

  
  const inqNo = await generateInquiryNo();
  const currentFYear = currentFy();

  const leadData = {
    fullName,
    contact: {
      phone: phoneNumber.trim(),
      whatsapp: whatsappNumber ? whatsappNumber.trim() : phoneNumber.trim(),
      email: email.toLowerCase().trim(),
    },
    preferences: {
      branchId: new mongoose.Types.ObjectId(prefferedBranch),
    },
    status: "inquiry_submitted",
    documents: {
      status: "na",
    },
    inqNo,
    inqFy: currentFYear,
    createdBy: {
      id: new mongoose.Types.ObjectId(createdById),
      type: "self",
    },
    inquiryStages: {
      stage1: "done",
      stage2: "pending",
      stage3: "pending",
    },
    inqForType: inquiryCategory,
    inqForPosition: inquiryFor,
  };

  const newInquiry = await Lead.create(leadData);

  await UserModel.findByIdAndUpdate(createdById, {
    enquired: "yes",
    $set: {
      "candidateProfile.leadId": new mongoose.Types.ObjectId(newInquiry?._id),
    },
  });

  return newInquiry;
};

export const updateInquiry = async (body: any) => {

  const {
    referedFrom,
    referedType,
    referedBy,
    otherReferedBy,
    workExperience, latestTechnical, latestAcademic, nationality,
    id
  } = body;

  const typeMapping: any = {
    "web-app": "web_app",
    call: "telecall",
    social: "social",
    reffer: "refer",
  };

  const refTypeMapping: any = {
    institution: "institute",
    pca: "pca",
    pcra: "pcra",
    other: "other",
  };

  const inquiry = await Lead.findById(id);
  if (!inquiry) {
    throw new ApiError(
      `Inquiry not found, Please fill step 1 first`,
      404,
    );
  }

  const leadData = {
    source: {
      type: typeMapping[referedFrom] || "none",

      refType:
        referedFrom === "reffer"
          ? refTypeMapping[referedType] || "other"
          : undefined,
      refName:
        referedFrom === "reffer"
          ? referedBy === "other"
            ? otherReferedBy
            : referedBy
          : undefined,
    },
    inquiryStages: {
      stage1: `done`,
      stage2: 'done',
      stage3: 'pending'
    }
  };

  const updatedInquiry = await Lead.findByIdAndUpdate(id, leadData,{ new: true });
const userUpdateFields: Record<string, any> = {};

  if (latestTechnical !== undefined && latestTechnical !== "") {
    userUpdateFields["candidateProfile.technicalQualification"] = latestTechnical;
  }
  if (latestAcademic !== undefined && latestAcademic !== "") {
    userUpdateFields["candidateProfile.academic"] = latestAcademic;
  }
  if (nationality !== undefined && nationality !== "") {
    userUpdateFields["candidateProfile.nationality"] = nationality;
  }
  if (workExperience !== undefined && workExperience !== "") {
    userUpdateFields["candidateProfile.workExp"] = workExperience;
  }

   if (Object.keys(userUpdateFields).length > 0 && inquiry.createdBy?.id) {
  await UserModel.findByIdAndUpdate(
    inquiry.createdBy.id,
    { $set: userUpdateFields },
    { new: true }
  );
}

  return updatedInquiry;
};


export const getTacListByBranch = async (branchId: string) => {
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw new ApiError("Invalid branch ID", 400);
  }

  const assignments = await EmployeeBranchShiftModel.find({ branchId })
    .populate("employeeId", "firstName lastName role")
    .lean();

  const rawTacList = assignments
    .filter((a: any) => a.employeeId && a.employeeId.role === "tac")
    .map((a: any) => ({
      _id: a.employeeId._id.toString(),
      firstName: a.employeeId.firstName,
      lastName: a.employeeId.lastName,
      role: a.employeeId.role,
      counterNo: a.counterNo ?? null,
    }));

  const uniqueTacList = Array.from(
    new Map(rawTacList.map((tac: any) => [tac._id, tac])).values()
  );

  return uniqueTacList;
};

export const getExternalSourcesByType = async (type: string) => {
  const validTypes = ["pca", "pcra", "institute"];

  const mappedType = type === "institution" ? "institute" : type;

  if (!validTypes.includes(mappedType)) {
    throw new ApiError("Invalid source type provided", 400);
  }

  const sources = await ExternalSourceModel.find({
    type: mappedType as any,
    status: "active",
  })
    .select("_id name type userId subOf status")
    .lean();

  return sources;
};

export const getInquiryByIdService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid Inquiry ID", 400);
  }
  const inquiry = await Lead.findById(id).lean();
  if (!inquiry) {
    throw new ApiError("Inquiry not found", 404);
  }
  return inquiry;
};