import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import env from '../../config/env.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import {
  getCurrentUserIdentities,
  initiateAadhaar,
  initiateAbha,
  verifyAadhaar,
  verifyAbha,
} from './identity.controller.js';

const router = Router();

function identityRateLimiter(limit) {
  return rateLimit({
    windowMs: env.identity.rateLimit.windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler(req, res) {
      res.status(429).json({
        success: false,
        message: 'Too many identity verification requests. Please try again later.',
        error: { code: 'IDENTITY_RATE_LIMITED' },
        requestId: req.requestId,
      });
    },
  });
}

router.get('/me', authenticate, getCurrentUserIdentities);

router.post('/abha/initiate', authenticate, authorize('PATIENT'),
  identityRateLimiter(env.identity.rateLimit.initiateMax), initiateAbha);
router.post('/abha/verify', authenticate, authorize('PATIENT'),
  identityRateLimiter(env.identity.rateLimit.verifyMax), verifyAbha);

router.post('/aadhaar/initiate', authenticate, authorize('PATIENT'),
  identityRateLimiter(env.identity.rateLimit.initiateMax), initiateAadhaar);
router.post('/aadhaar/verify', authenticate, authorize('PATIENT'),
  identityRateLimiter(env.identity.rateLimit.verifyMax), verifyAadhaar);

export default router;
