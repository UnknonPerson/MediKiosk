import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import requireAccountStatus from '../../middleware/requireAccountStatus.js';
import {
  uploadProfilePhoto,
  uploadVerificationDocument,
} from '../../middleware/upload.js';
import {
  getCurrentDoctorProfile,
  getCurrentDoctorVerificationStatus,
  submitCurrentDoctorVerification,
  updateCurrentDoctorProfile,
  uploadCurrentDoctorDocument,
  uploadCurrentDoctorProfilePhoto,
} from './doctor.controller.js';

const router = Router();
const accessibleDoctorStatuses = requireAccountStatus('PENDING', 'UNDER_REVIEW', 'ACTIVE');
const pendingDoctorOnly = requireAccountStatus('PENDING');

router.get('/me', authenticate, authorize('DOCTOR'), accessibleDoctorStatuses, getCurrentDoctorProfile);
router.patch('/me', authenticate, authorize('DOCTOR'), pendingDoctorOnly, updateCurrentDoctorProfile);
router.post(
  '/me/documents',
  authenticate,
  authorize('DOCTOR'),
  pendingDoctorOnly,
  uploadVerificationDocument,
  uploadCurrentDoctorDocument,
);
router.post(
  '/me/profile-photo',
  authenticate,
  authorize('DOCTOR'),
  pendingDoctorOnly,
  uploadProfilePhoto,
  uploadCurrentDoctorProfilePhoto,
);
router.post(
  '/me/submit-verification',
  authenticate,
  authorize('DOCTOR'),
  pendingDoctorOnly,
  submitCurrentDoctorVerification,
);
router.get(
  '/me/verification-status',
  authenticate,
  authorize('DOCTOR'),
  accessibleDoctorStatuses,
  getCurrentDoctorVerificationStatus,
);

export default router;
