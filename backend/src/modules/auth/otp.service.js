import crypto from 'node:crypto';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import OtpRequest, { OTP_PURPOSES } from './otp.model.js';

function hashSecret() {
  if (!env.otp.hashSecret) {
    throw new ApiError(500, 'OTP service is not configured', { code: 'OTP_CONFIGURATION_ERROR' });
  }

  return env.otp.hashSecret;
}

function validPurpose(purpose) {
  if (!OTP_PURPOSES.includes(purpose)) {
    throw new ApiError(400, 'Invalid OTP purpose', { code: 'INVALID_OTP_PURPOSE' });
  }
}

function invalidOtp(code = 'INVALID_OTP') {
  return new ApiError(401, 'Invalid or expired OTP', { code });
}

function validTarget(target) {
  if (typeof target !== 'string' || !/^\+91[6-9]\d{9}$/.test(target)) {
    throw new ApiError(400, 'A valid Indian phone number is required', { code: 'INVALID_PHONE_NUMBER' });
  }
}

export function normalizeIndianPhone(phone) {
  if (typeof phone !== 'string') {
    throw new ApiError(400, 'A valid Indian phone number is required', { code: 'INVALID_PHONE_NUMBER' });
  }

  const compact = phone.trim().replace(/[\s()-]/g, '');
  let normalized;

  if (/^[6-9]\d{9}$/.test(compact)) {
    normalized = `+91${compact}`;
  } else if (/^91[6-9]\d{9}$/.test(compact)) {
    normalized = `+${compact}`;
  } else if (/^0[6-9]\d{9}$/.test(compact)) {
    normalized = `+91${compact.slice(1)}`;
  } else {
    normalized = compact;
  }

  if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
    throw new ApiError(400, 'A valid Indian phone number is required', { code: 'INVALID_PHONE_NUMBER' });
  }

  return normalized;
}

export function generateOtp(length = env.otp.length) {
  let otp = '';

  for (let index = 0; index < length; index += 1) {
    otp += crypto.randomInt(0, 10).toString();
  }

  return otp;
}

export function hashOtp(otp) {
  if (typeof otp !== 'string' || !/^\d+$/.test(otp)) {
    throw new ApiError(400, 'OTP must contain only digits', { code: 'INVALID_OTP_FORMAT' });
  }

  return crypto.createHmac('sha256', hashSecret()).update(otp, 'utf8').digest('hex');
}

function otpExpiryDate() {
  return new Date(Date.now() + (env.otp.expiryMinutes * 60 * 1000));
}

function isCorrectLength(otp) {
  return typeof otp === 'string' && new RegExp(`^\\d{${env.otp.length}}$`).test(otp);
}

function timingSafeHashMatch(actualHash, expectedHash) {
  const actual = Buffer.from(actualHash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export async function invalidateExistingOtp({ purpose, target } = {}) {
  validPurpose(purpose);
  validTarget(target);

  await OtpRequest.updateOne({
    purpose,
    target,
    consumedAt: null,
  }, {
    $set: { consumedAt: new Date() },
  });
}

export async function createOtp({ purpose, target } = {}) {
  validPurpose(purpose);
  validTarget(target);
  const otp = generateOtp();
  const expiresAt = otpExpiryDate();

  await invalidateExistingOtp({ purpose, target });

  const request = await OtpRequest.findOneAndUpdate({
    purpose,
    target,
  }, {
    $set: {
      otpHash: hashOtp(otp),
      expiresAt,
      attempts: 0,
      maxAttempts: env.otp.maxAttempts,
      consumedAt: null,
    },
  }, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  });

  return { otp, expiresAt, request };
}

export async function verifyOtp({ purpose, target, otp } = {}) {
  validPurpose(purpose);
  validTarget(target);

  if (!isCorrectLength(otp)) {
    throw new ApiError(400, 'OTP format is invalid', { code: 'INVALID_OTP_FORMAT' });
  }

  const now = new Date();
  const request = await OtpRequest.findOne({ purpose, target }).select('+otpHash');

  if (!request || !request.isUsable(now)) {
    throw invalidOtp(request?.attempts >= request?.maxAttempts ? 'OTP_ATTEMPTS_EXCEEDED' : 'INVALID_OTP');
  }

  const expectedHash = hashOtp(otp);
  if (!timingSafeHashMatch(request.otpHash, expectedHash)) {
    const updatedRequest = await OtpRequest.findOneAndUpdate({
      _id: request._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: request.maxAttempts },
    }, {
      $inc: { attempts: 1 },
    }, {
      new: true,
    });

    if (updatedRequest?.attempts >= updatedRequest?.maxAttempts) {
      await OtpRequest.updateOne({
        _id: updatedRequest._id,
        consumedAt: null,
      }, {
        $set: { consumedAt: new Date() },
      });
    }

    throw invalidOtp(updatedRequest?.attempts >= updatedRequest?.maxAttempts
      ? 'OTP_ATTEMPTS_EXCEEDED'
      : 'INVALID_OTP');
  }

  const consumedRequest = await OtpRequest.findOneAndUpdate({
    _id: request._id,
    consumedAt: null,
    expiresAt: { $gt: now },
    attempts: { $lt: request.maxAttempts },
  }, {
    $set: { consumedAt: now },
  }, {
    new: true,
  });

  if (!consumedRequest) {
    throw invalidOtp();
  }

  return { purpose: consumedRequest.purpose, target: consumedRequest.target };
}
