import { Lead } from "../../models/Lead.model";
import { EmployeeBranchShiftModel } from "../../models/EmployeeBranchShift.model";
import UserModel from "../../models/User.model";
import { ApiError } from "../../error/api.error";
import mongoose from "mongoose";

import "../../models/Branch.model";
import { generateInquiryNo } from "@/Utils/generateInquiryNo";
import { currentFy } from "@/Utils/common";

export const createInquiry = async (body: any, createdById: string) => {
  const {
    fullName,
    email,
    phoneNumber,
    whatsappNumber,
    prefferedBranch,
    prefferedConsultant,
    visitOption,
    fullAddress,
    referedFrom,
    referedType,
    referedBy,
    otherReferedBy,
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

  const existingInquiry = await Lead.findOne({
    $or: [
      { "contact.email": email.toLowerCase().trim() },
      { "contact.phone": phoneNumber.trim() },
    ],
  });

  if (existingInquiry) {
    throw new ApiError(
      `You already inquiried. \n ID - ${existingInquiry.inqNo}`,
      409,
    );
  }

  const inqNo = await generateInquiryNo();
  const currentFYear = currentFy();
  // Assign tac for no choice of consultant couter wise as per branch

  const leadData = {
    fullName,
    contact: {
      phone: phoneNumber,
      whatsapp: whatsappNumber || phoneNumber,
      email: email,
    },
    address: fullAddress,
    preferences: {
      branchId: new mongoose.Types.ObjectId(prefferedBranch),
      consultantId: prefferedConsultant
        ? new mongoose.Types.ObjectId(prefferedConsultant)
        : null,
      visitType: Number(visitOption) === 2 ? "online" : "offline",
    },
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
    status: 'inquiry_submitted',
    documents: {
      status: 'na'
    },
    inqNo,
    inqFy: currentFYear,
    createdBy: {
      id: new mongoose.Types.ObjectId(createdById),
      type: "self",
    },
  };

  const newInquiry = await Lead.create(leadData);
  await UserModel.findByIdAndUpdate(createdById, { enquired: "yes" });
  return newInquiry;
};

export const getTacListByBranch = async (branchId: string) => {
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw new ApiError("Invalid branch ID", 400);
  }

  const assignments = await EmployeeBranchShiftModel.find({ branchId })
    .populate("employeeId", "firstName lastName role")
    .lean();

  const tacList = assignments
    .map((a: any) => a.employeeId)
    .filter((emp: any) => emp && emp.role === "tac");

  return tacList;
};

export const getExternalSourcesByType = async (type: string) => {
  const validTypes = ["pca", "pcra", "institute"];

  const mappedType = type === "institution" ? "institute" : type;

  if (!validTypes.includes(mappedType)) {
    throw new ApiError("Invalid source type provided", 400);
  }

  const sources = await UserModel.find({
    role: mappedType as any,
    status: "active",
  })
    .select("firstName lastName email")
    .lean();

  return sources;
};
