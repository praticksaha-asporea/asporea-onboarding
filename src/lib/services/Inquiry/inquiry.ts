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
    // prefferedBranch,
    prefferedConsultant,
    visitOption,
    fullAddress,
    referedFrom,
    referedType,
    referedBy,
    otherReferedBy,
    passportNo,
    latitude,
    longitude
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
      `You already inquired. \n ID - ${existingInquiry.inqNo}`,
      409,
    );
  }

  const inqNo = await generateInquiryNo();
  const currentFYear = currentFy();
  const radius = 50 * 1000;
  const isOnline = Number(visitOption) === 2;
  let prefferedBranch = "";

  // ── Resolve which TAC (consultantId) to assign ──────────────────────────────
  let resolvedConsultantId: mongoose.Types.ObjectId | null = null;

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
  prefferedBranch = await branch?._id;
  // console.log(branch, 2222);
  if (prefferedConsultant) {
    // Consultant explicitly chosen — always honour it regardless of visit type
    resolvedConsultantId = new mongoose.Types.ObjectId(prefferedConsultant);
  } else if (isOnline) {
    // Online visit with no preferred consultant → auto-assign a TAC
    const [generalSettings] = await Promise.all([
      GeneralSettingModel.findOne().lean(),
      // BranchModel.findById(prefferedBranch).lean(),
    ]);

    // if (!branch) {
    //   throw new ApiError("Selected branch not found", 404);
    // }
    // prefferedBranch get branch from lat long nearest


    // Fetch all EmployeeBranchShift records for this branch where the
    // linked user has role "tac", and collect their counterNo values.
    const tacShifts = await EmployeeBranchShiftModel.find({
      branchId: new mongoose.Types.ObjectId(prefferedBranch),
    })
      .populate<{ employeeId: { _id: mongoose.Types.ObjectId; role: string } }>(
        "employeeId",
        "role"
      )
      .lean();

    // Build list of { employeeId, counterNo } for active TAC users only
    const rawTacEntries = tacShifts
      .filter((s: any) => s.employeeId && s.employeeId.role === "tac" && s.counterNo != null)
      .map((s: any) => ({
        employeeId: s.employeeId._id as mongoose.Types.ObjectId,
        counterNo: s.counterNo as number,
      }));

    const tacEntries = Array.from(
      new Map(rawTacEntries.map((e: any) => [e.employeeId.toString(), e])).values()
    );

    if (tacEntries.length > 0) {
      const assignmentType = generalSettings?.tacAssignmentType ?? "random";
      const lastUsedCounter: number = (branch as any).lastUsedCounter ?? 0;

      // When there is more than one TAC counter, exclude the branch's
      // lastUsedCounter from the candidate pool to avoid repeating it.
      const eligibleEntries =
        tacEntries.length > 1
          ? tacEntries.filter((e) => e.counterNo !== lastUsedCounter)
          : tacEntries;

      if (assignmentType === "random") {
        // Pick a random TAC from the eligible pool
        const pick = eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];
        resolvedConsultantId = pick.employeeId;

        // Update branch lastUsedCounter to the chosen counter
        await BranchModel.findByIdAndUpdate(prefferedBranch, {
          lastUsedCounter: pick.counterNo,
        });
      } else {
        // counterwise — advance one step from lastUsedCounter (round-robin by index)
        // Sort entries by counterNo for deterministic ordering
        const sorted = [...tacEntries].sort((a, b) => a.counterNo - b.counterNo);
        const lastIdx = sorted.findIndex((e) => e.counterNo === lastUsedCounter);
        const nextIdx = lastIdx === -1 ? 0 : (lastIdx + 1) % sorted.length;
        const pick = sorted[nextIdx];
        resolvedConsultantId = pick.employeeId;

        // Persist the new lastUsedCounter on the branch
        await BranchModel.findByIdAndUpdate(prefferedBranch, {
          lastUsedCounter: pick.counterNo,
        });
      }
    }
    // If no TAC entries found, resolvedConsultantId stays null — graceful degradation
  }
  // Offline + no consultant → resolvedConsultantId stays null (reception handles assignment)
  // ────────────────────────────────────────────────────────────────────────────
  console.log(prefferedBranch, 666);

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
      consultantId: resolvedConsultantId,
      visitType: isOnline ? "online" : "offline",
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
    passport: {
      status: passportNo ? "having" : "no",
      no: passportNo || ""
    },
    inquiryStages: {
      stage1: `done`,
      stage2: 'pending',
      stage3: 'pending'
    }
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