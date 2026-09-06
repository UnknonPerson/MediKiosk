import mongoose from 'mongoose';
import User from '../users/user.model.js';
import {
  createSession,
  generateAccessToken,
  assertAccessTokenConfiguration,
  accessTokenExpiresIn,
} from '../auth/token.service.js';
import {
  createOtp,
  invalidateExistingOtp,
  normalizeIndianPhone,
  verifyOtp,
} from '../auth/otp.service.js';
import { getOtpProvider } from '../auth/otp.providers.js';
import { assertUserCanAuthenticate } from '../auth/auth.service.js';
import Session from '../auth/session.model.js';
import ApiError from '../../utils/ApiError.js';
import PatientProfile, { PATIENT_GENDERS } from './patient.model.js';

const PATIENT_PHONE_LOGIN = 'PATIENT_PHONE_LOGIN';
const PROFILE_UPDATE_FIELDS = new Set([
  'fullName',
  'dateOfBirth',
  'gender',
  'address',
  'emergencyContact',
]);

function accountConflict() {
  return new ApiError(409, 'This phone number is associated with a different account type', {
    code: 'PHONE_ACCOUNT_CONFLICT',
  });
}

function invalidProfileField(message) {
  return new ApiError(400, message, { code: 'INVALID_PROFILE_DATA' });
}

function profileIsComplete(profile) {
  return Boolean(profile.fullName && profile.dateOfBirth && profile.gender);
}

function safeProfile(profile) {
  return {
    id: profile._id.toString(),
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    address: profile.address,
    emergencyContact: profile.emergencyContact,
    profilePhoto: profile.profilePhoto,
    profileCompleted: profile.profileCompleted,
  };
}

function normaliseFullName(value) {
  if (typeof value !== 'string') throw invalidProfileField('Full name must be a string');

  const fullName = value.trim().replace(/\s+/g, ' ');
  if (fullName.length < 2 || fullName.length > 120) {
    throw invalidProfileField('Full name must be between 2 and 120 characters');
  }

  return fullName;
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
  if (!PATIENT_GENDERS.includes(gender)) {
    throw invalidProfileField('Gender is invalid');
  }

  return gender;
}

function normaliseAddress(value) {
  if (typeof value !== 'string') throw invalidProfileField('Address must be a string');

  const address = value.trim().replace(/\s+/g, ' ');
  if (address.length === 0 || address.length > 500) {
    throw invalidProfileField('Address must be between 1 and 500 characters');
  }

  return address;
}

function normaliseEmergencyContact(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidProfileField('Emergency contact must be an object');
  }

  const allowedFields = new Set(['name', 'phone', 'relationship']);
  const unknownField = Object.keys(value).find((field) => !allowedFields.has(field));
  if (unknownField) {
    throw invalidProfileField(`Emergency contact field is not allowed: ${unknownField}`);
  }

  const name = normaliseFullName(value.name);
  const phone = normalizeIndianPhone(value.phone);
  const relationship = value.relationship === undefined ? undefined : String(value.relationship).trim();

  if (relationship !== undefined && (relationship.length === 0 || relationship.length > 80)) {
    throw invalidProfileField('Emergency contact relationship must be between 1 and 80 characters');
  }

  return { name, phone, relationship };
}

function profileUpdates(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw invalidProfileField('Profile update data must be an object');
  }

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
  if (Object.hasOwn(payload, 'address')) updates.address = normaliseAddress(payload.address);
  if (Object.hasOwn(payload, 'emergencyContact')) {
    updates.emergencyContact = payload.emergencyContact === null
      ? undefined
      : normaliseEmergencyContact(payload.emergencyContact);
  }

  return updates;
}

async function ensurePatientProfile(userId) {
  let profile = await PatientProfile.findOne({ userId });
  if (profile) return profile;

  try {
    profile = await PatientProfile.create({ userId });
    return profile;
  } catch (error) {
    if (error?.code !== 11000) throw error;

    profile = await PatientProfile.findOne({ userId });
    if (!profile) throw error;
    return profile;
  }
}

function transactionIsUnavailable(error) {
  return error?.code === 20
    || /transactions are only allowed on a replica set member or mongos/i.test(error?.message || '')
    || /does not support transactions/i.test(error?.message || '');
}

async function issuePatientTokens(user, requestMetadata, databaseSession) {
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

async function createPatientAccountWithCompensation(phone, requestMetadata) {
  const user = await User.create({
    accountType: 'PATIENT',
    phone: {
      value: phone,
      verified: true,
      verifiedAt: new Date(),
    },
    authenticationMethods: ['PHONE_OTP'],
    status: 'ACTIVE',
    lastLogin: new Date(),
  });

  try {
    const profile = await PatientProfile.create({ userId: user._id });
    const tokens = await issuePatientTokens(user, requestMetadata);
    return { user, profile, tokens };
  } catch (error) {
    await Promise.allSettled([
      Session.deleteMany({ userId: user._id }),
      PatientProfile.deleteOne({ userId: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);
    throw error;
  }
}

async function createPatientAccountWithTransaction(phone, requestMetadata) {
  const databaseSession = await mongoose.startSession();
  let result;

  try {
    await databaseSession.withTransaction(async () => {
      const [user] = await User.create([{
        accountType: 'PATIENT',
        phone: {
          value: phone,
          verified: true,
          verifiedAt: new Date(),
        },
        authenticationMethods: ['PHONE_OTP'],
        status: 'ACTIVE',
        lastLogin: new Date(),
      }], { session: databaseSession });
      const [profile] = await PatientProfile.create([{ userId: user._id }], { session: databaseSession });
      const tokens = await issuePatientTokens(user, requestMetadata, databaseSession);
      result = { user, profile, tokens };
    });

    return result;
  } finally {
    await databaseSession.endSession();
  }
}

async function createPatientAccount(phone, requestMetadata) {
  try {
    return await createPatientAccountWithTransaction(phone, requestMetadata);
  } catch (error) {
    if (!transactionIsUnavailable(error)) throw error;

    return createPatientAccountWithCompensation(phone, requestMetadata);
  }
}

export async function sendPatientPhoneOtp(rawPhone) {
  const phone = normalizeIndianPhone(rawPhone);
  const otpRequest = await createOtp({ purpose: PATIENT_PHONE_LOGIN, target: phone });

  try {
    await getOtpProvider().sendOtp({
      purpose: PATIENT_PHONE_LOGIN,
      target: phone,
      otp: otpRequest.otp,
    });
  } catch (error) {
    await invalidateExistingOtp({ purpose: PATIENT_PHONE_LOGIN, target: phone });
    throw error;
  }
}

export async function authenticatePatientWithPhoneOtp({ phone: rawPhone, otp, requestMetadata } = {}) {
  assertAccessTokenConfiguration();
  const phone = normalizeIndianPhone(rawPhone);
  await verifyOtp({ purpose: PATIENT_PHONE_LOGIN, target: phone, otp });

  let user = await User.findOne({ 'phone.value': phone });
  let profile;
  let tokens;

  if (user) {
    if (user.accountType !== 'PATIENT') throw accountConflict();
    assertUserCanAuthenticate(user);

    user.phone.verified = true;
    user.phone.verifiedAt = new Date();
    if (!user.authenticationMethods.includes('PHONE_OTP')) {
      user.authenticationMethods.push('PHONE_OTP');
    }
    user.lastLogin = new Date();
    await user.save();
    profile = await ensurePatientProfile(user._id);
  } else {
    ({ user, profile, tokens } = await createPatientAccount(phone, requestMetadata));
  }

  tokens = tokens || await issuePatientTokens(user, requestMetadata);
  return {
    user: user.toSafeObject(),
    profileCompleted: profile.profileCompleted,
    ...tokens,
  };
}

export async function getPatientProfile(userId) {
  const profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Patient profile was not found', { code: 'PATIENT_PROFILE_NOT_FOUND' });
  }

  return safeProfile(profile);
}

export async function updatePatientProfile(userId, payload) {
  const profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Patient profile was not found', { code: 'PATIENT_PROFILE_NOT_FOUND' });
  }

  Object.assign(profile, profileUpdates(payload));
  profile.profileCompleted = profileIsComplete(profile);
  await profile.save();

  return safeProfile(profile);
}
