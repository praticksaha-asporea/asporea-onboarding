import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import connectToDatabase from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload.model";
import ResponseHandler from "@/lib/utils/responseUtil";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    const user = token ? await verifyToken(token) : null;

     
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return ResponseHandler.sendError(res, "File upload failed", 500);

      const uploadedFile = Array.isArray(files.file)
        ? files.file[0]
        : files.file;
      if (!uploadedFile)
        return ResponseHandler.sendError(res, "No file provided", 400);

      const filePath = `/uploads/${path.basename(uploadedFile.filepath)}`;

      const newUpload = await Upload.create({
        userId: user?.id,
        path: filePath,
        publicId: uploadedFile.newFilename,
      });

      return ResponseHandler.sendSuccess(
        res,
        { uploadId: newUpload._id, path: filePath },
        "File uploaded",
      );
    });
  } catch (error: any) {
    return ResponseHandler.sendError(res, error.message || "Upload Error", 500);
  }
}
