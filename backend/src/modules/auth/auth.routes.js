import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import env from '../../config/env.js';
import authenticate from '../../middleware/authenticate.js';
import {
  getCurrentUser,
  logoutCurrentSession,
  refresh,
  sendDoctorPhoneVerificationOtp,
  sendPatientPhoneLoginOtp,
  verifyDoctorPhoneVerificationOtp,
  verifyPatientPhoneLoginOtp,
} from './auth.controller.js';

const router = Router();

function otpRateLimiter(limit) {
  return rateLimit({
    windowMs: env.otp.rateLimit.windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler(req, res) {
      res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.',
        error: { code: 'OTP_RATE_LIMITED' },
        requestId: req.requestId,
      });
    },
  });
}

router.post('/refresh', refresh);
router.post('/logout', logoutCurrentSession);
router.get('/me', authenticate, getCurrentUser);
router.post('/patient/phone/send-otp', otpRateLimiter(env.otp.rateLimit.sendMax), sendPatientPhoneLoginOtp);
router.post('/patient/phone/verify-otp', otpRateLimiter(env.otp.rateLimit.verifyMax), verifyPatientPhoneLoginOtp);
router.post('/doctor/phone/send-otp', otpRateLimiter(env.otp.rateLimit.sendMax), sendDoctorPhoneVerificationOtp);
router.post('/doctor/phone/verify-otp', otpRateLimiter(env.otp.rateLimit.verifyMax), verifyDoctorPhoneVerificationOtp);

export default router;
