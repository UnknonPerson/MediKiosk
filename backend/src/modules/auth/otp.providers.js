import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

function maskedTarget(target) {
  return `${target.slice(0, 3)}******${target.slice(-4)}`;
}

const mockOtpProvider = Object.freeze({
  name: 'mock',
  async sendOtp({ purpose, target, otp }) {
    if (env.isProduction) {
      throw new ApiError(503, 'OTP delivery service is unavailable', {
        code: 'OTP_PROVIDER_UNAVAILABLE',
      });
    }

    if (env.otp.mockLogCodes) {
      console.info(JSON.stringify({
        level: 'warn',
        event: 'otp.mock_code_generated',
        purpose,
        target: maskedTarget(target),
        otp,
      }));
    }

    return { provider: 'mock' };
  },
});

export function getOtpProvider() {
  if (env.otp.provider === 'mock') return mockOtpProvider;

  throw new ApiError(503, 'OTP delivery service is unavailable', {
    code: 'OTP_PROVIDER_UNAVAILABLE',
  });
}
