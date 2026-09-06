import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logout, refreshAuthentication } from './auth.service.js';
import {
  authenticatePatientWithPhoneOtp,
  sendPatientPhoneOtp,
} from '../patients/patient.service.js';
import {
  authenticateDoctorByPhoneOtp,
  sendDoctorPhoneOtp,
} from '../doctors/doctor.service.js';

function refreshTokenFromRequest(req) {
  const { refreshToken } = req.body || {};

  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    throw new ApiError(400, 'A refresh token is required', { code: 'REFRESH_TOKEN_REQUIRED' });
  }

  return refreshToken;
}

function requestMetadata(req) {
  return {
    deviceInfo: req.get('user-agent'),
    ipAddress: req.ip,
  };
}

export const refresh = asyncHandler(async (req, res) => {
  const tokens = await refreshAuthentication(refreshTokenFromRequest(req), requestMetadata(req));

  res.status(200).json(new ApiResponse({
    tokenType: 'Bearer',
    ...tokens,
  }, 'Tokens refreshed successfully'));
});

export const logoutCurrentSession = asyncHandler(async (req, res) => {
  await logout(refreshTokenFromRequest(req));

  res.status(200).json(new ApiResponse({}, 'Logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(req.user, 'Current user retrieved successfully'));
});

export const sendPatientPhoneLoginOtp = asyncHandler(async (req, res) => {
  await sendPatientPhoneOtp(req.body?.phone);

  res.status(200).json(new ApiResponse({}, 'If the phone number is eligible, an OTP has been sent.'));
});

export const verifyPatientPhoneLoginOtp = asyncHandler(async (req, res) => {
  const authentication = await authenticatePatientWithPhoneOtp({
    phone: req.body?.phone,
    otp: req.body?.otp,
    requestMetadata: requestMetadata(req),
  });

  res.status(200).json(new ApiResponse(authentication, 'Authentication successful'));
});

export const sendDoctorPhoneVerificationOtp = asyncHandler(async (req, res) => {
  await sendDoctorPhoneOtp(req.body?.phone);

  res.status(200).json(new ApiResponse({}, 'If the phone number is eligible, an OTP has been sent.'));
});

export const verifyDoctorPhoneVerificationOtp = asyncHandler(async (req, res) => {
  const authentication = await authenticateDoctorByPhoneOtp({
    phone: req.body?.phone,
    otp: req.body?.otp,
    requestMetadata: requestMetadata(req),
  });

  res.status(200).json(new ApiResponse(authentication, 'Authentication successful'));
});
