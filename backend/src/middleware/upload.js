const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = String(file.mimetype || '').toLowerCase();

  const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
  const allowedMime = new Set(['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

  if (allowedExt.has(ext) && allowedMime.has(mime)) {
    cb(null, true);
    return;
  }

  cb(new Error('Only PDF, JPG, JPEG, PNG, and WEBP files are allowed'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
