import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  getUserIdentities,
  initiateAadhaarVerification,
  initiateAbhaVerification,
  verifyAadhaarVerification,
  verifyAbhaVerification,
} from './identity.service.js';

export const initiateAbha = asyncHandler(async (req, res) => {
  const result = await initiateAbhaVerification({
    userId: req.user.id,
    identifier: req.body?.identifier,
  });

  res.status(200).json(new ApiResponse(result, 'ABHA verification initiated'));
});

export const verifyAbha = asyncHandler(async (req, res) => {
  const result = await verifyAbhaVerification({
    userId: req.user.id,
    transactionId: req.body?.transactionId,
    challenge: req.body?.challenge,
  });

  res.status(200).json(new ApiResponse(result, 'ABHA identity verified'));
});

export const initiateAadhaar = asyncHandler(async (req, res) => {
  const result = await initiateAadhaarVerification({
    userId: req.user.id,
    identifier: req.body?.identifier,
  });

  res.status(200).json(new ApiResponse(result, 'Aadhaar verification initiated'));
});

export const verifyAadhaar = asyncHandler(async (req, res) => {
  const result = await verifyAadhaarVerification({
    userId: req.user.id,
    transactionId: req.body?.transactionId,
    challenge: req.body?.challenge,
  });

  res.status(200).json(new ApiResponse(result, 'Aadhaar identity verified'));
});

export const getCurrentUserIdentities = asyncHandler(async (req, res) => {
  const identities = await getUserIdentities(req.user.id);
  res.status(200).json(new ApiResponse(identities, 'User identities retrieved successfully'));
});
