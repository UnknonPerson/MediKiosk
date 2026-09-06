import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import { getCurrentPatientProfile, updateCurrentPatientProfile } from './patient.controller.js';

const router = Router();

router.get('/me', authenticate, authorize('PATIENT'), getCurrentPatientProfile);
router.patch('/me', authenticate, authorize('PATIENT'), updateCurrentPatientProfile);

export default router;
