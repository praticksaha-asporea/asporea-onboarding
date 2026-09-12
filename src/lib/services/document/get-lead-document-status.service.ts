import { ApiError } from "@/lib/error/api.error";
import { Position } from "@/lib/models/Position.model";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

export interface ILeadDocumentStatusResult {
  status: string;
  documentStatus: string;
  realDocsCount: number;
  experienceType?: string | null;
  offeredPosition: string | null;
  inqForPosition: string | null;
}

export const getLeadDocumentStatusService = async (
  leadId?: string,
): Promise<ILeadDocumentStatusResult> => {
  if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Valid leadId is required", 400);
  }

  await connectToDatabase();

  const db = mongoose.connection.db;
  if (!db) {
    throw new ApiError("Database connection not established", 500);
  }

  const lead = await db.collection("leads").findOne(
    { _id: new mongoose.Types.ObjectId(leadId) },
    {
      projection: {
        status: 1,
        documents: 1,
        experience: 1,
        offeredPosition: 1,
        inqForPosition: 1,
      },
    },
  );

  if (!lead) {
    throw new ApiError("Lead not found", 404);
  }

  const positionIds = [lead.offeredPosition, lead.inqForPosition]
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id.toString()))
    .map((id) => new mongoose.Types.ObjectId(id.toString()));

  const positions = await Position.find(
    { _id: { $in: positionIds } },
    { title: 1 },
  ).lean();

  const positionMap = new Map(
    positions.map((p) => [p._id.toString(), p.title]),
  );

  const offeredPositionTitle = lead.offeredPosition
    ? (positionMap.get(lead.offeredPosition.toString()) ?? "")
    : "";

  const inqForPositionTitle = lead.inqForPosition
    ? (positionMap.get(lead.inqForPosition.toString()) ?? "")
    : "";

  const documentCount = await db.collection("documents").countDocuments({
    leadId: new mongoose.Types.ObjectId(leadId),
  });

  if (documentCount === 0) {
    return {
      status: lead.status,
      documentStatus: "na",
      realDocsCount: 0,
      offeredPosition: offeredPositionTitle || null,
      inqForPosition: inqForPositionTitle || null,
    };
  }

  return {
    status: lead.status,
    documentStatus: lead.documents?.status,
    realDocsCount: documentCount,
    experienceType: lead.experience?.type || null,
    offeredPosition: offeredPositionTitle || null,
    inqForPosition: inqForPositionTitle || null,
  };
};
