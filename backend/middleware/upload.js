const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    // The client names each file with its own tempId (kept in file.originalname).
    // The stored name is a fresh UUID so uploads can never collide or overwrite.
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${EXT[file.mimetype]}`),
  }),
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype]
      ? cb(null, true)
      : cb(new Error("Only PNG, JPG or WEBP images are allowed.")),
  limits: { fileSize: 5 * 1024 * 1024, files: 50 },
});

const removeFiles = (files = []) =>
  files.forEach((f) => fs.unlink(f.path, () => {}));

// Accepts up to 50 images in the "images" field. Upload problems answer 400 JSON
// (the frontend reads the `error` key) instead of Express's default HTML 500.
const uploadImages = (req, res, next) => {
  upload.array("images")(req, res, (err) => {
    if (!err) {
      // if anything later rejects the request, do not leave its files on disk
      res.on("finish", () => {
        if (res.statusCode >= 400) removeFiles(req.files);
      });
      return next();
    }
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller." : err.message;
    return res.status(400).json({ error: message });
  });
};

// multipart bodies carry the JSON in a single "data" field; unwrap it so the
// zod validate() middleware can treat it like a normal JSON body.
const parseJsonField = (field) => (req, res, next) => {
  try {
    req.body = JSON.parse(req.body?.[field] ?? "");
    next();
  } catch {
    res.status(400).json({ error: "Invalid request body." });
  }
};

module.exports = { uploadImages, parseJsonField, removeFiles, UPLOAD_DIR };
