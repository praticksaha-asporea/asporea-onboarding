import formidable, { Fields, Files } from "formidable";
import { NextApiRequest } from "next";
import fs from "fs";
import path from "path";
export type ParsedForm = {
  fields: Record<string, string | string[]>;
  files: Files;
};

/**
 * Parses a multipart/form-data request.
 * Returns flat fields (single value or array) and any uploaded files.
 */
// export function parseForm(req: NextApiRequest): Promise<ParsedForm> {
//   const form = formidable({ multiples: true });

//   return new Promise((resolve, reject) => {
//     form.parse(req, (err, fields, files) => {
//       if (err) return reject(err);

//       // Normalize: formidable v3 always returns arrays — flatten single-value fields
//       const normalized: Record<string, string | string[]> = {};
//       for (const [key, val] of Object.entries(fields as Fields)) {
//         if (Array.isArray(val)) {
//           normalized[key] = val.length === 1 ? val[0] : val;
//         } else {
//           normalized[key] = val ?? "";
//         }
//       }

//       resolve({ fields: normalized, files });
//     });
//   });
// }
export const parseForm = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};
/**
 * Normalizes a FormData body for Joi validation.
 * - Splits comma-separated array fields into real arrays
 * - Converts "true"/"false" strings to booleans
 * - Converts numeric strings to numbers for specified keys
 */
export function normalizeFormFields(
  fields: Record<string, string | string[]>,
  arrayKeys: string[] = [],
  boolKeys: string[] = [],
  numberKeys: string[] = [],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(fields)) {
    if (arrayKeys.includes(key)) {
      // Accept repeated fields (already array) or comma-separated string
      const arr = Array.isArray(val)
        ? val
        : val.split(",").map((s) => s.trim()).filter(Boolean);
      result[key] = arr;
    } else if (boolKeys.includes(key)) {
      result[key] = val === "true" || val === "1";
    } else if (numberKeys.includes(key)) {
      result[key] = Number(val);
    } else {
      result[key] = Array.isArray(val) ? val[0] : val;
    }
  }

  return result;
}
