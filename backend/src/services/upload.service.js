import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import env from '../config/env.js';
import {
  PROFILE_PHOTO_MIME_TYPES,
  VERIFICATION_DOCUMENT_MIME_TYPES,
} from '../middleware/upload.js';
import ApiError from '../utils/ApiError.js';

export const UPLOAD_CATEGORIES = Object.freeze({
  PATIENT_PROFILE_PHOTO: Object.freeze({
    folder: 'vaidyam/patients/profile-photos',
    resourceType: 'image',
    allowedMimeTypes: PROFILE_PHOTO_MIME_TYPES,
    maxFileSize: env.uploads.maxProfilePhotoSize,
  }),
  DOCTOR_PROFILE_PHOTO: Object.freeze({
    folder: 'vaidyam/doctors/profile-photos',
    resourceType: 'image',
    allowedMimeTypes: PROFILE_PHOTO_MIME_TYPES,
    maxFileSize: env.uploads.maxProfilePhotoSize,
  }),
  HOSPITAL_PROFILE_PHOTO: Object.freeze({
    folder: 'vaidyam/hospitals/profile-photos',
    resourceType: 'image',
    allowedMimeTypes: PROFILE_PHOTO_MIME_TYPES,
    maxFileSize: env.uploads.maxProfilePhotoSize,
  }),
  DOCTOR_VERIFICATION_DOCUMENT: Object.freeze({
    folder: 'vaidyam/doctors/verification-documents',
    resourceType: 'auto',
    allowedMimeTypes: VERIFICATION_DOCUMENT_MIME_TYPES,
    maxFileSize: env.uploads.maxDocumentSize,
  }),
  HOSPITAL_VERIFICATION_DOCUMENT: Object.freeze({
    folder: 'vaidyam/hospitals/verification-documents',
    resourceType: 'auto',
    allowedMimeTypes: VERIFICATION_DOCUMENT_MIME_TYPES,
    maxFileSize: env.uploads.maxDocumentSize,
  }),
});

const PROFILE_CATEGORY_BY_OWNER = Object.freeze({
  patient: 'PATIENT_PROFILE_PHOTO',
  doctor: 'DOCTOR_PROFILE_PHOTO',
  hospital: 'HOSPITAL_PROFILE_PHOTO',
});

const DOCUMENT_CATEGORY_BY_OWNER = Object.freeze({
  doctor: 'DOCTOR_VERIFICATION_DOCUMENT',
  hospital: 'HOSPITAL_VERIFICATION_DOCUMENT',
});

function configuredCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, 'File upload service is not configured', {
      code: 'UPLOAD_PROVIDER_UNAVAILABLE',
    });
  }
}

function categoryDefinition(category) {
  const definition = UPLOAD_CATEGORIES[category];

  if (!definition) {
    throw new ApiError(400, 'Invalid upload category', { code: 'INVALID_UPLOAD_CATEGORY' });
  }

  return definition;
}

function validateUploadFile(file, definition) {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    throw new ApiError(400, 'A file is required', { code: 'UPLOAD_FILE_REQUIRED' });
  }

  if (!definition.allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError(415, 'Unsupported file type', { code: 'UNSUPPORTED_FILE_TYPE' });
  }

  const fileSize = file.buffer.length;
  if (fileSize > definition.maxFileSize) {
    throw new ApiError(413, 'File exceeds the allowed size limit', { code: 'FILE_TOO_LARGE' });
  }
}

function providerError(message, code) {
  return new ApiError(502, message, { code });
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(providerError('File upload failed', 'UPLOAD_PROVIDER_ERROR'));
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

function safeUploadedFile(result) {
  if (!result?.secure_url || !result.public_id || !result.resource_type) {
    throw providerError('File upload returned an invalid response', 'INVALID_UPLOAD_PROVIDER_RESPONSE');
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  };
}

function safePublicId(publicId) {
  return typeof publicId === 'string'
    && /^vaidyam\/[a-z0-9_/-]+$/i.test(publicId)
    && !publicId.includes('..');
}

function validResourceType(resourceType) {
  return resourceType === 'image' || resourceType === 'raw';
}

export async function uploadFile(file, category) {
  const definition = categoryDefinition(category);
  validateUploadFile(file, definition);
  configuredCloudinary();

  let result;
  try {
    result = await uploadBuffer(file.buffer, {
      folder: definition.folder,
      resource_type: definition.resourceType,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw providerError('File upload failed', 'UPLOAD_PROVIDER_ERROR');
  }

  return safeUploadedFile(result);
}

export function uploadProfilePhoto(file, ownerType) {
  const category = PROFILE_CATEGORY_BY_OWNER[ownerType];
  return uploadFile(file, category);
}

export function uploadVerificationDocument(file, ownerType) {
  const category = DOCUMENT_CATEGORY_BY_OWNER[ownerType];
  return uploadFile(file, category);
}

export async function deleteFile(publicId, resourceType) {
  if (!safePublicId(publicId) || !validResourceType(resourceType)) {
    throw new ApiError(400, 'Invalid file reference', { code: 'INVALID_FILE_REFERENCE' });
  }

  configuredCloudinary();

  let result;
  try {
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch (error) {
    throw providerError('File deletion failed', 'FILE_DELETION_FAILED');
  }

  if (result?.result === 'ok') return true;
  if (result?.result === 'not found') return false;

  throw providerError('File deletion failed', 'FILE_DELETION_FAILED');
}

export async function replaceFile({ file, category, previousFile, persistNewFile } = {}) {
  if (previousFile && typeof persistNewFile !== 'function') {
    throw new TypeError('persistNewFile is required when replacing an existing file');
  }

  if (previousFile && (!safePublicId(previousFile.publicId) || !validResourceType(previousFile.resourceType))) {
    throw new ApiError(400, 'Invalid file reference', { code: 'INVALID_FILE_REFERENCE' });
  }

  const uploadedFile = await uploadFile(file, category);

  if (persistNewFile) {
    try {
      await persistNewFile(uploadedFile);
    } catch (error) {
      try {
        await deleteFile(uploadedFile.publicId, uploadedFile.resourceType);
      } catch (cleanupError) {
        console.error(JSON.stringify({
          level: 'error',
          event: 'upload.replacement_cleanup_failed',
          errorName: cleanupError.name,
        }));
      }

      throw error;
    }
  }

  if (previousFile) {
    await deleteFile(previousFile.publicId, previousFile.resourceType);
  }

  return uploadedFile;
}
