import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getPresignedPutUrl, uploadBuffer, getPublicUrl } from "../lib/s3";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Local disk upload (unchanged)
router.post("/", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `${process.env.UPLOADS_BASE_URL || "http://localhost:4000"}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl, filename: req.file.filename });
});

// Generate a presigned PUT URL for client direct upload to S3
router.post("/presign", async (req: Request, res: Response) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename) return res.status(400).json({ error: "filename is required" });
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
    const url = await getPresignedPutUrl(key, contentType || "application/octet-stream");
    const publicUrl = getPublicUrl(key);
    res.json({ url, key, publicUrl });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "failed to presign" });
  }
});

// Server-side upload to S3 (multipart form upload)
router.post("/s3", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const buffer = fs.readFileSync(req.file.path);
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${req.file.originalname}`;
    const publicUrl = await uploadBuffer(key, buffer, req.file.mimetype);
    // Remove temp file
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    res.status(201).json({ url: publicUrl, key });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "failed to upload to s3" });
  }
});

export default router;