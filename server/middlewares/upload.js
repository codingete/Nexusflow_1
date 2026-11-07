import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ErrorHandler from "./error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Only a real ObjectId may become part of the path (no "../" tricks).
    const projectId = req.params.projectId;
    const uploadPath = /^[a-f0-9]{24}$/i.test(projectId || "")
      ? path.join(__dirname, "../uploads/projects", projectId)
      : path.join(__dirname, "../uploads/temp");

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname);
  cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
},
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-rar",
    "application/vnd.rar",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/javascript",
    "text/css",
    "text/html",
    "application/json",
  ];
  const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".zip",
  ".rar",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".txt",
  ".js",
  ".css",
  ".html",
  ".json",
];

const fileExt = path.extname(file.originalname).toLowerCase();

if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
  cb(null, true);
} else {
  cb(new ErrorHandler("Invalid file type. Only PDF, DOC, DOCX, PPT, ZIP, RAR, IMAGES, and code files are allowed.", 400),
  false
);
}
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 10 files allowed",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
next(err);
  
};

export {upload,handleUploadError};