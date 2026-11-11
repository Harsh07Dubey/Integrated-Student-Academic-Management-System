const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Allowed file extensions and their MIME types
const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Create a multer storage engine for a given subdirectory.
 * @param {string} subDir - Subdirectory inside 'uploads/' (e.g. 'resources', 'pyqs')
 */
const createStorage = (subDir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = path.join(__dirname, '..', '..', 'uploads', subDir);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

/**
 * File filter that rejects unsupported MIME types.
 */
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed types: pdf, doc, docx, ppt, pptx, xls, xlsx, jpg, png'
      ),
      false
    );
  }
};

/** Multer instance for resource uploads */
const uploadResource = multer({
  storage: createStorage('resources'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** Multer instance for PYQ uploads */
const uploadPyq = multer({
  storage: createStorage('pyqs'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = {
  uploadResource,
  uploadPyq,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
};
