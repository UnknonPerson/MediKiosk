import mongoose from 'mongoose';
import User from '../users/user.model.js';
import Session from '../auth/session.model.js';
import {
  accessTokenExpiresIn,
  assertAccessTokenConfiguration,
  createSession,
  generateAccessToken,
} from '../auth/token.service.js';
import {
  createOtp,
  invalidateExistingOtp,
  normalizeIndianPhone,
  verifyOtp,
} from '../auth/otp.service.js';
import { getOtpProvider } from '../auth/otp.providers.js';
import { assertUserCanAuthenticate } from '../auth/auth.service.js';
import {
  deleteFile,
  replaceFile,
  uploadVerificationDocument,
} from '../../services/upload.service.js';
import ApiError from '../../utils/ApiError.js';
import DoctorProfile, {
  CONSULTATION_LANGUAGES,
  DOCTOR_DOCUMENT_TYPES,
  DOCTOR_GENDERS,
} from './doctor.model.js';

const DOCTOR_PHONE_VERIFICATION = 'DOCTOR_PHONE_VERIFICATION';
const PROFILE_UPDATE_FIELDS = new Set([
  'fullName',
  'dateOfBirth',
  'gender',
  'professionalRegistration',
  'specialization',
  'qualifications',
  'experienceYears',
  'consultationLanguages',
]);

function accountConflict() {
  return new ApiError(409, 'This phone number is associated with a different account type', {
    code: 'PHONE_ACCOUNT_CONFLICT',
  });
}

function invalidProfileField(message) {
  return new ApiError(400, message, { code: 'INVALID_DOCTOR_PROFILE_DATA' });
}

function ensurePlainObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidProfileField(message);
  }
}

function normaliseText(value, { field, min = 1, max }) {
  if (typeof value !== 'string') {
    throw invalidProfileField(`${field} must be a string`);
  }

  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < min || normalized.length > max) {
    throw invalidProfileField(`${field} must be between ${min} and ${max} characters`);
  }

  return normalized;
}

function normaliseFullName(value) {
  return normaliseText(value, { field: 'Full name', min: 2, max: 120 });
}

function normaliseDateOfBirth(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw invalidProfileField('Date of birth must use YYYY-MM-DD format');
  }

  const dateOfBirth = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth.toISOString().slice(0, 10) !== value) {
    throw invalidProfileField('Date of birth is invalid');
  }

  if (dateOfBirth > new Date()) {
    throw invalidProfileField('Date of birth cannot be in the future');
  }

  return dateOfBirth;
}

function normaliseGender(value) {
  if (typeof value !== 'string') throw invalidProfileField('Gender must be a string');

  const gender = value.trim().toUpperCase();
  if (!DOCTOR_GENDERS.includes(gender)) {
    throw invalidProfileField('Gender is invalid');
  }

  return gender;
}

function normaliseYear(value, field) {
  const year = Number(value);
  const currentYear = new Date().getUTCFullYear();

  if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
    throw invalidProfileField(`${field} must be a year between 1900 and ${currentYear}`);
  }

  return year;
}

function rejectUnknownFields(value, allowedFields, field) {
  const unknownField = Object.keys(value).find((key) => !allowedFields.has(key));
  if (unknownField) {
    throw invalidProfileField(`${field} contains an unsupported field: ${unknownField}`);
  }
}

function normaliseProfessionalRegistration(value) {
  ensurePlainObject(value, 'Professional registration must be an object');
  const allowedFields = new Set([
    'registrationNumber',
    'registrationAuthority',
    'state',
    'registrationYear',
  ]);
  rejectUnknownFields(value, allowedFields, 'Professional registration');

  const registration = {
    registrationNumber: normaliseText(value.registrationNumber, {
      field: 'Registration number', min: 2, max: 80,
    }),
    registrationAuthority: normaliseText(value.registrationAuthority, {
      field: 'Registration authority', min: 2, max: 120,
    }),
  };

  if (value.state !== undefined) {
    registration.state = normaliseText(value.state, { field: 'Registration state', min: 2, max: 80 });
  }
  if (value.registrationYear !== undefined) {
    registration.registrationYear = normaliseYear(value.registrationYear, 'Registration year');
  }

  return registration;
}

function normaliseQualification(value) {
  ensurePlainObject(value, 'Each qualification must be an object');
  const allowedFields = new Set(['degree', 'institution', 'year']);
  rejectUnknownFields(value, allowedFields, 'Qualification');

  return {
    degree: normaliseText(value.degree, { field: 'Qualification degree', min: 2, max: 120 }),
    institution: normaliseText(value.institution, {
      field: 'Qualification institution', min: 2, max: 160,
    }),
    year: normaliseYear(value.year, 'Qualification year'),
  };
}

function normaliseQualifications(value) {
  if (!Array.isArray(value) || value.length > 20) {
    throw invalidProfileField('Qualifications must be an array containing at most 20 items');
  }

  return value.map(normaliseQualification);
}

function normaliseExperienceYears(value) {
  const experienceYears = Number(value);
  if (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 80) {
    throw invalidProfileField('Experience years must be a whole number between 0 and 80');
  }

  return experienceYears;
}

function normaliseConsultationLanguages(value) {
  if (!Array.isArray(value) || value.length > 23) {
    throw invalidProfileField('Consultation languages must be an array containing at most 23 items');
  }

  const languages = value.map((language) => {
    if (typeof language !== 'string') {
      throw invalidProfileField('Consultation languages must contain only strings');
    }

    const normalized = language.trim().toUpperCase();
    if (!CONSULTATION_LANGUAGES.includes(normalized)) {
      throw invalidProfileField('Consultation language is not supported');
    }

    return normalized;
  });

  if (new Set(languages).size !== languages.length) {
    throw invalidProfileField('Consultation languages must not contain duplicates');
  }

  return languages;
}

function profileUpdates(payload) {
  ensurePlainObject(payload, 'Profile update data must be an object');
  const fields = Object.keys(payload);
  if (fields.length === 0) throw invalidProfileField('At least one profile field is required');

  const unknownField = fields.find((field) => !PROFILE_UPDATE_FIELDS.has(field));
  if (unknownField) {
    throw new ApiError(400, `Profile field is not allowed: ${unknownField}`, {
      code: 'PROFILE_FIELD_NOT_ALLOWED',
    });
  }

  const updates = {};
  if (Object.hasOwn(payload, 'fullName')) updates.fullName = normaliseFullName(payload.fullName);
  if (Object.hasOwn(payload, 'dateOfBirth')) updates.dateOfBirth = normaliseDateOfBirth(payload.dateOfBirth);
  if (Object.hasOwn(payload, 'gender')) updates.gender = normaliseGender(payload.gender);
  if (Object.hasOwn(payload, 'professionalRegistration')) {
    updates.professionalRegistration = normaliseProfessionalRegistration(payload.professionalRegistration);
  }
  if (Object.hasOwn(payload, 'specialization')) {
    updates.specialization = normaliseText(payload.specialization, {
      field: 'Specialization', min: 2, max: 120,
    });
  }
  if (Object.hasOwn(payload, 'qualifications')) {
    updates.qualifications = normaliseQualifications(payload.qualifications);
  }
  if (Object.hasOwn(payload, 'experienceYears')) {
    updates.experienceYears = normaliseExperienceYears(payload.experienceYears);
  }
  if (Object.hasOwn(payload, 'consultationLanguages')) {
    updates.consultationLanguages = normaliseConsultationLanguages(payload.consultationLanguages);
  }

  return updates;
}

function safeProfile(profile) {
  return {
    id: profile._id.toString(),
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    profilePhoto: profile.profilePhoto,
    professionalRegistration: profile.professionalRegistration,
    specialization: profile.specialization,
    qualifications: profile.qualifications,
    experienceYears: profile.experienceYears,
    consultationLanguages: profile.consultationLanguages,
    professionalDocuments: profile.professionalDocuments,
    verification: {
      status: profile.verification?.status,
      submittedAt: profile.verification?.submittedAt,
      reviewedAt: profile.verification?.reviewedAt,
      rejectionReason: profile.verification?.rejectionReason,
    },
    profileCompleted: profile.profileCompleted,
  };
}

function registrationCompleteness(profile) {
  const missing = [];
  if (!profile.fullName) missing.push('fullName');
  if (!profile.dateOfBirth) missing.push('dateOfBirth');
  if (!profile.gender) missing.push('gender');
  if (!profile.professionalRegistration?.registrationNumber) {
    missing.push('professionalRegistration.registrationNumber');
  }
  if (!profile.professionalRegistration?.registrationAuthority) {
    missing.push('professionalRegistration.registrationAuthority');
  }
  if (!profile.specialization) missing.push('specialization');
  if (!Array.isArray(profile.qualifications) || profile.qualifications.length === 0) {
    missing.push('qualifications');
  }
  if (!Array.isArray(profile.professionalDocuments) || profile.professionalDocuments.length === 0) {
    missing.push('professionalDocuments');
  }

  return { complete: missing.length === 0, missing };
}

export function isDoctorRegistrationComplete(profile) {
  return registrationCompleteness(profile).complete;
}

function transactionIsUnavailable(error) {
  return error?.code === 20
    || /transactions are only allowed on a replica set member or mongos/i.test(error?.message || '')
    || /does not support transactions/i.test(error?.message || '');
}

async function ensureDoctorProfile(userId) {
  let profile = await DoctorProfile.findOne({ userId });
  if (profile) return profile;

  try {
    return await DoctorProfile.create({ userId });
  } catch (error) {
    if (error?.code !== 11000) throw error;

    profile = await DoctorProfile.findOne({ userId });
    if (!profile) throw error;
    return profile;
  }
}

async function issueDoctorTokens(user, requestMetadata, databaseSession) {
  const accessToken = generateAccessToken(user);
  const { refreshToken } = await createSession({
    userId: user._id,
    deviceInfo: requestMetadata?.deviceInfo,
    ipAddress: requestMetadata?.ipAddress,
    databaseSession,
  });

  return {
    tokenType: 'Bearer',
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
  };
}

function newDoctorUser(phone) {
  return {
    accountType: 'DOCTOR',
    phone: {
      value: phone,
      verified: true,
      verifiedAt: new Date(),
    },
    authenticationMethods: ['PHONE_OTP'],
    status: 'PENDING',
    lastLogin: new Date(),
  };
}

async function createDoctorAccountWithCompensation(phone, requestMetadata) {
  const user = await User.create(newDoctorUser(phone));

  try {
    const profile = await DoctorProfile.create({ userId: user._id });
    const tokens = await issueDoctorTokens(user, requestMetadata);
    return { user, profile, tokens };
  } catch (error) {
    await Promise.allSettled([
      Session.deleteMany({ userId: user._id }),
      DoctorProfile.deleteOne({ userId: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);
    throw error;
  }
}

async function createDoctorAccountWithTransaction(phone, requestMetadata) {
  const databaseSession = await mongoose.startSession();
  let result;

  try {
    await databaseSession.withTransaction(async () => {
      const [user] = await User.create([newDoctorUser(phone)], { session: databaseSession });
      const [profile] = await DoctorProfile.create([{ userId: user._id }], { session: databaseSession });
      const tokens = await issueDoctorTokens(user, requestMetadata, databaseSession);
      result = { user, profile, tokens };
    });

    return result;
  } finally {
    await databaseSession.endSession();
  }
}

async function createDoctorAccount(phone, requestMetadata) {
  try {
    return await createDoctorAccountWithTransaction(phone, requestMetadata);
  } catch (error) {
    if (!transactionIsUnavailable(error)) throw error;
    return createDoctorAccountWithCompensation(phone, requestMetadata);
  }
}

export async function sendDoctorPhoneOtp(rawPhone) {
  const phone = normalizeIndianPhone(rawPhone);
  const otpRequest = await createOtp({ purpose: DOCTOR_PHONE_VERIFICATION, target: phone });

  try {
    await getOtpProvider().sendOtp({
      purpose: DOCTOR_PHONE_VERIFICATION,
      target: phone,
      otp: otpRequest.otp,
    });
  } catch (error) {
    await invalidateExistingOtp({ purpose: DOCTOR_PHONE_VERIFICATION, target: phone });
    throw error;
  }
}

export async function authenticateDoctorByPhoneOtp({ phone: rawPhone, otp, requestMetadata } = {}) {
  assertAccessTokenConfiguration();
  const phone = normalizeIndianPhone(rawPhone);
  await verifyOtp({ purpose: DOCTOR_PHONE_VERIFICATION, target: phone, otp });

  let user = await User.findOne({ 'phone.value': phone });
  let profile;
  let tokens;

  if (user) {
    if (user.accountType !== 'DOCTOR') throw accountConflict();
    assertUserCanAuthenticate(user);

    user.phone.verified = true;
    user.phone.verifiedAt = new Date();
    if (!user.authenticationMethods.includes('PHONE_OTP')) {
      user.authenticationMethods.push('PHONE_OTP');
    }
    user.lastLogin = new Date();
    await user.save();
    profile = await ensureDoctorProfile(user._id);
  } else {
    ({ user, profile, tokens } = await createDoctorAccount(phone, requestMetadata));
  }

  tokens = tokens || await issueDoctorTokens(user, requestMetadata);
  return {
    user: user.toSafeObject(),
    profileCompleted: profile.profileCompleted,
    verificationStatus: profile.verification.status,
    ...tokens,
  };
}

async function findDoctorProfile(userId) {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Doctor profile was not found', { code: 'DOCTOR_PROFILE_NOT_FOUND' });
  }

  return profile;
}

export async function getDoctorProfile(userId) {
  return safeProfile(await findDoctorProfile(userId));
}

export async function updateDoctorProfile(userId, payload) {
  const profile = await findDoctorProfile(userId);
  Object.assign(profile, profileUpdates(payload));
  profile.profileCompleted = isDoctorRegistrationComplete(profile);
  await profile.save();
  return safeProfile(profile);
}

function documentType(value) {
  if (typeof value !== 'string' || !DOCTOR_DOCUMENT_TYPES.includes(value.trim().toUpperCase())) {
    throw new ApiError(400, 'Document type is invalid', { code: 'INVALID_DOCTOR_DOCUMENT_TYPE' });
  }

  return value.trim().toUpperCase();
}

async function cleanupUploadedFile(file, event) {
  try {
    await deleteFile(file.publicId, file.resourceType);
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      event,
      errorName: error.name,
    }));
  }
}

export async function addDoctorProfessionalDocument(userId, type, file) {
  const normalizedType = documentType(type);
  const uploadedFile = await uploadVerificationDocument(file, 'doctor');

  try {
    const profile = await findDoctorProfile(userId);
    profile.professionalDocuments.push({
      type: normalizedType,
      ...uploadedFile,
      uploadedAt: new Date(),
    });
    profile.profileCompleted = isDoctorRegistrationComplete(profile);
    await profile.save();
    return safeProfile(profile);
  } catch (error) {
    await cleanupUploadedFile(uploadedFile, 'doctor.document_upload_cleanup_failed');
    throw error;
  }
}

export async function updateDoctorProfilePhoto(userId, file) {
  const profile = await findDoctorProfile(userId);
  const previousFile = profile.profilePhoto?.publicId
    ? profile.profilePhoto.toObject()
    : undefined;

  await replaceFile({
    file,
    category: 'DOCTOR_PROFILE_PHOTO',
    previousFile,
    persistNewFile: async (uploadedFile) => {
      profile.profilePhoto = uploadedFile;
      await profile.save();
    },
  });

  return safeProfile(profile);
}

function submissionNotAllowed(message = 'Doctor verification cannot be submitted in the current state') {
  return new ApiError(409, message, { code: 'DOCTOR_VERIFICATION_SUBMISSION_NOT_ALLOWED' });
}

function applySubmission(doctor, user, now) {
  if (user.accountType !== 'DOCTOR' || user.status !== 'PENDING') {
    throw submissionNotAllowed();
  }
  if (doctor.verification.status !== 'DRAFT') {
    throw submissionNotAllowed();
  }

  const completeness = registrationCompleteness(doctor);
  if (!completeness.complete) {
    throw new ApiError(400, 'Doctor registration is incomplete', {
      code: 'DOCTOR_REGISTRATION_INCOMPLETE',
      details: { missing: completeness.missing },
    });
  }

  doctor.profileCompleted = true;
  doctor.verification.status = 'UNDER_REVIEW';
  doctor.verification.submittedAt = now;
  doctor.verification.reviewedAt = undefined;
  doctor.verification.reviewedBy = undefined;
  doctor.verification.rejectionReason = undefined;
  user.status = 'UNDER_REVIEW';
}

function snapshotTransition(doctor, user) {
  return {
    verification: doctor.verification?.toObject?.() || { ...doctor.verification },
    profileCompleted: doctor.profileCompleted,
    userStatus: user.status,
  };
}

async function restoreTransition(doctor, user, previous) {
  doctor.verification = previous.verification;
  doctor.profileCompleted = previous.profileCompleted;
  user.status = previous.userStatus;
  await Promise.allSettled([doctor.save(), user.save()]);
}

async function synchronizeDoctorAndUser({
  doctorId,
  userId,
  apply,
}) {
  const databaseSession = await mongoose.startSession();
  let result;

  try {
    await databaseSession.withTransaction(async () => {
      const doctor = await DoctorProfile.findById(doctorId).session(databaseSession);
      if (!doctor) {
        throw new ApiError(404, 'Doctor profile was not found', { code: 'DOCTOR_PROFILE_NOT_FOUND' });
      }
      const user = await User.findById(userId).session(databaseSession);
      if (!user) {
        throw new ApiError(404, 'Doctor user was not found', { code: 'DOCTOR_USER_NOT_FOUND' });
      }

      apply(doctor, user);
      await doctor.save({ session: databaseSession });
      await user.save({ session: databaseSession });
      result = { doctor, user };
    });

    return result;
  } catch (error) {
    if (!transactionIsUnavailable(error)) throw error;
  } finally {
    await databaseSession.endSession();
  }

  const doctor = await DoctorProfile.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile was not found', { code: 'DOCTOR_PROFILE_NOT_FOUND' });
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Doctor user was not found', { code: 'DOCTOR_USER_NOT_FOUND' });
  }

  const previous = snapshotTransition(doctor, user);
  apply(doctor, user);
  try {
    await doctor.save();
    await user.save();
  } catch (error) {
    await restoreTransition(doctor, user, previous);
    throw error;
  }

  return { doctor, user };
}

export async function submitDoctorVerification(userId) {
  const profile = await findDoctorProfile(userId);
  const { doctor, user } = await synchronizeDoctorAndUser({
    doctorId: profile._id,
    userId,
    apply: (doctorProfile, doctorUser) => applySubmission(doctorProfile, doctorUser, new Date()),
  });

  return {
    profile: safeProfile(doctor),
    accountStatus: user.status,
  };
}

export async function getDoctorVerificationStatus(userId) {
  const [profile, user] = await Promise.all([
    findDoctorProfile(userId),
    User.findById(userId),
  ]);

  if (!user || user.accountType !== 'DOCTOR') {
    throw new ApiError(404, 'Doctor user was not found', { code: 'DOCTOR_USER_NOT_FOUND' });
  }

  return {
    accountStatus: user.status,
    verificationStatus: profile.verification.status,
    submittedAt: profile.verification.submittedAt,
    reviewedAt: profile.verification.reviewedAt,
    rejectionReason: profile.verification.rejectionReason,
  };
}

function validReviewerId(reviewedBy) {
  if (!mongoose.isValidObjectId(reviewedBy)) {
    throw new ApiError(400, 'A valid reviewer is required', { code: 'INVALID_REVIEWER' });
  }
}

function requireUnderReview(doctor, user) {
  if (doctor.verification.status !== 'UNDER_REVIEW' || user.status !== 'UNDER_REVIEW') {
    throw new ApiError(409, 'Doctor verification is not under review', {
      code: 'DOCTOR_VERIFICATION_NOT_UNDER_REVIEW',
    });
  }
}

export async function approveDoctorVerification({ doctorId, reviewedBy } = {}) {
  if (!mongoose.isValidObjectId(doctorId)) {
    throw new ApiError(400, 'A valid doctor profile is required', { code: 'INVALID_DOCTOR_PROFILE' });
  }
  validReviewerId(reviewedBy);

  const profile = await DoctorProfile.findById(doctorId);
  if (!profile) {
    throw new ApiError(404, 'Doctor profile was not found', { code: 'DOCTOR_PROFILE_NOT_FOUND' });
  }

  const { doctor, user } = await synchronizeDoctorAndUser({
    doctorId: profile._id,
    userId: profile.userId,
    apply: (doctorProfile, doctorUser) => {
      requireUnderReview(doctorProfile, doctorUser);
      doctorProfile.verification.status = 'VERIFIED';
      doctorProfile.verification.reviewedAt = new Date();
      doctorProfile.verification.reviewedBy = reviewedBy;
      doctorProfile.verification.rejectionReason = undefined;
      doctorUser.status = 'ACTIVE';
    },
  });

  return { profile: safeProfile(doctor), accountStatus: user.status };
}

export async function rejectDoctorVerification({ doctorId, reviewedBy, rejectionReason } = {}) {
  if (!mongoose.isValidObjectId(doctorId)) {
    throw new ApiError(400, 'A valid doctor profile is required', { code: 'INVALID_DOCTOR_PROFILE' });
  }
  validReviewerId(reviewedBy);
  const reason = normaliseText(rejectionReason, { field: 'Rejection reason', min: 5, max: 500 });

  const profile = await DoctorProfile.findById(doctorId);
  if (!profile) {
    throw new ApiError(404, 'Doctor profile was not found', { code: 'DOCTOR_PROFILE_NOT_FOUND' });
  }

  const { doctor, user } = await synchronizeDoctorAndUser({
    doctorId: profile._id,
    userId: profile.userId,
    apply: (doctorProfile, doctorUser) => {
      requireUnderReview(doctorProfile, doctorUser);
      doctorProfile.verification.status = 'REJECTED';
      doctorProfile.verification.reviewedAt = new Date();
      doctorProfile.verification.reviewedBy = reviewedBy;
      doctorProfile.verification.rejectionReason = reason;
      doctorUser.status = 'REJECTED';
    },
  });

  return { profile: safeProfile(doctor), accountStatus: user.status };
}
