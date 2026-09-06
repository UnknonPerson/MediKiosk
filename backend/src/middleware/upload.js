import multer from 'multer';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const PROFILE_PHOTO_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const VERIFICATION_DOCUMENT_MIME_TYPES = Object.freeze([
  'application/pdf',
  ...PROFILE_PHOTO_MIME_TYPES,
]);

function unsupportedFileType() {
  return new ApiError(415, 'Unsupported file type', {
    code: 'UNSUPPORTED_FILE_TYPE',
  });
}

function createSingleFileUpload({ allowedMimeTypes, maxFileSize }) {
  const parser = multer({
    storage: multer.memoryStorage(),
    limits: {
      files: 1,
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(unsupportedFileType());
      }

      return callback(null, true);
    },
  }).single('file');

  return (req, res, next) => {
    parser(req, res, (error) => {
      if (!error) return next();
      if (error instanceof ApiError) return next(error);

      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, 'File exceeds the allowed size limit', {
          code: 'FILE_TOO_LARGE',
        }));
      }

      if (error instanceof multer.MulterError) {
        return next(new ApiError(400, 'Invalid file upload', { code: 'INVALID_UPLOAD' }));
      }

      return next(error);
    });
  };
}

export const uploadProfilePhoto = createSingleFileUpload({
  allowedMimeTypes: PROFILE_PHOTO_MIME_TYPES,
  maxFileSize: env.uploads.maxProfilePhotoSize,
});

export const uploadVerificationDocument = createSingleFileUpload({
  allowedMimeTypes: VERIFICATION_DOCUMENT_MIME_TYPES,
  maxFileSize: env.uploads.maxDocumentSize,
});
