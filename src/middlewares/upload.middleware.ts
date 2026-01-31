import multer from "multer";
import { v4 as uuidv4 } from "uuid"; // Works with uuid v8
import path from "path";
import fs from "fs";
import { Request } from "express";
import { HttpError } from "../errors/http-error";

/**
 * Create a reusable multer instance for a given folder
 * @param folderName - folder inside public/uploads
 */
export const createUpload = (folderName: string) => {
  const uploadDir = path.join(__dirname, "../../public/uploads", folderName);

  // Create folder if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Multer storage config
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req: Request, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}_${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });

  // File filter to allow only images
  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new HttpError(400, "Only image files are allowed!"));
    }
    cb(null, true);
  };

  // Return multer instance
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

  return {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray),
  };
};
