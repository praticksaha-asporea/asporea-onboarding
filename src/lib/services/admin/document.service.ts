import { ApiError } from "@/lib/error/api.error";
import { DocumentType } from "@/lib/models/DocumentType.model";
import mongoose from "mongoose";

export const createDocumentType = async (body: any) => {
    const { title, section, subTitle, supportedExtensions, required, multiple } = body;

    // console.log(body,8777);

    const branch = await DocumentType.create({
        title,
        section,
        subTitle,
        supportedExtensions,
        required,
        multiple,
    });

    return branch;
};


export const documentTypeList = async ({
    keyword,
    page = 1,
    limit = 10,
}: {
    keyword?: string;
    page?: number;
    limit?: number;
}) => {
    const filter: Record<string, unknown> = {};

    if (keyword && keyword.trim().length > 0) {
        filter.title = new RegExp(keyword.trim(), "i");
    }

    const skip = (page - 1) * limit;

    const [types, total] = await Promise.all([
        DocumentType.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        DocumentType.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        types,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};

export const deleteType = async (typeId: string) => {
    if (!mongoose.Types.ObjectId.isValid(typeId))
        throw new ApiError("Invalid document type ID", 400);

    const deleted =
        await DocumentType.findByIdAndDelete(typeId);
    if (!deleted) throw new ApiError("Document Type not found", 404);

    return { message: "Document Type deleted successfully" };
};


export const updateType = async (typeId: string, body: any) => {
    if (!mongoose.Types.ObjectId.isValid(typeId))
        throw new ApiError("Invalid document type ID", 400);

    const ALLOWED = ["title", "section", "subTitle", "supportedExtensions", "required", "multiple"];
    let update: Record<string, unknown> = {};

    for (const key of ALLOWED) {
        if (body[key] !== undefined) update[key] = body[key];
    }

    const updated = await DocumentType.findByIdAndUpdate(
        typeId,
        { $set: update },
        { new: true, runValidators: true },
    );

    return updated;
};

export const viewDocumentType = async (DocumentTypeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(DocumentTypeId))
    throw new ApiError("Invalid Document Type ID", 400);

  const documentType = await DocumentType.findById(DocumentTypeId).lean();
  if (!documentType) throw new ApiError("Document Type not found", 404);

  return documentType;
};