import path from "path";
import fs from "fs";
import { Upload } from "@/lib/models/Upload.model";

interface UploadFileParams {
    file: any;
    userId?: string;
}

export const uploadFileService = async ({
    file,
    userId,
}: UploadFileParams) => {
    if (!file) {
        throw new Error("No file provided");
    }

    const uploadedFile = Array.isArray(file) ? file[0] : file;

    const originalExt = path.extname(
        uploadedFile.originalFilename || "",
    );

    const hasOriginalExt =
        uploadedFile.newFilename?.endsWith(originalExt);

    const finalFilename = hasOriginalExt
        ? uploadedFile.newFilename
        : `${uploadedFile.newFilename}${originalExt}`;

    const finalPath = path.join(
        process.cwd(),
        "public/uploads",
        finalFilename,
    );

    fs.renameSync(uploadedFile.filepath, finalPath);

    const filePath = `/uploads/${finalFilename}`;

    const newUpload = await Upload.create({
        userId,
        path: filePath,
        publicId: finalFilename,
    });

    return {
        uploadId: newUpload._id,
        path: filePath,
    };
};