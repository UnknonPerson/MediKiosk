import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  addDoctorProfessionalDocument,
  getDoctorProfile,
  getDoctorVerificationStatus,
  submitDoctorVerification,
  updateDoctorProfile,
  updateDoctorProfilePhoto,
} from './doctor.service.js';

export const getCurrentDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await getDoctorProfile(req.user.id);
  res.status(200).json(new ApiResponse(profile, 'Doctor profile retrieved successfully'));
});

export const updateCurrentDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await updateDoctorProfile(req.user.id, req.body);
  res.status(200).json(new ApiResponse(profile, 'Doctor profile updated successfully'));
});

export const uploadCurrentDoctorDocument = asyncHandler(async (req, res) => {
  const profile = await addDoctorProfessionalDocument(req.user.id, req.body?.type, req.file);
  res.status(201).json(new ApiResponse(profile, 'Doctor verification document uploaded successfully'));
});

export const uploadCurrentDoctorProfilePhoto = asyncHandler(async (req, res) => {
  const profile = await updateDoctorProfilePhoto(req.user.id, req.file);
  res.status(200).json(new ApiResponse(profile, 'Doctor profile photo updated successfully'));
});

export const submitCurrentDoctorVerification = asyncHandler(async (req, res) => {
  const verification = await submitDoctorVerification(req.user.id);
  res.status(200).json(new ApiResponse(verification, 'Doctor verification submitted successfully'));
});

export const getCurrentDoctorVerificationStatus = asyncHandler(async (req, res) => {
  const verification = await getDoctorVerificationStatus(req.user.id);
  res.status(200).json(new ApiResponse(verification, 'Doctor verification status retrieved successfully'));
});
