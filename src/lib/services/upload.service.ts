import fs from "fs";
import path from "path";
import crypto from "crypto";
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

    // Determine extension
    let extension =
        path.extname(uploadedFile.originalFilename || "") ||
        path.extname(uploadedFile.filepath || "");

    if (!extension && uploadedFile.mimetype) {
        extension = `.${uploadedFile.mimetype.split("/")[1]}`;
    }

    if (!extension) {
        extension = ".jpg";
    }

    // Generate filename if newFilename doesn't exist
    const finalFilename = uploadedFile.newFilename
        ? uploadedFile.newFilename.endsWith(extension)
            ? uploadedFile.newFilename
            : `${uploadedFile.newFilename}${extension}`
        : `${crypto.randomUUID()}${extension}`;

    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalPath = path.join(uploadDir, finalFilename);

    // Handle both Formidable uploads and downloaded buffers
    if (uploadedFile.buffer) {
        fs.writeFileSync(finalPath, uploadedFile.buffer);
    } else if (uploadedFile.filepath) {
        fs.renameSync(uploadedFile.filepath, finalPath);
    } else {
        throw new Error("Invalid file object");
    }

    const filePath = `/uploads/${finalFilename}`;

    const newUpload = await Upload.create({
        userId,
        path: filePath,
        publicId: finalFilename,
    });

    return {
        uploadId: newUpload._id,
        path: filePath,
        filename: finalFilename,
    };
};