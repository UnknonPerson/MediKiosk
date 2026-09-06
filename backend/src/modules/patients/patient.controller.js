import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { getPatientProfile, updatePatientProfile } from './patient.service.js';

export const getCurrentPatientProfile = asyncHandler(async (req, res) => {
  const profile = await getPatientProfile(req.user.id);
  res.status(200).json(new ApiResponse(profile, 'Patient profile retrieved successfully'));
});

export const updateCurrentPatientProfile = asyncHandler(async (req, res) => {
  const profile = await updatePatientProfile(req.user.id, req.body);
  res.status(200).json(new ApiResponse(profile, 'Patient profile updated successfully'));
});
