import ApiError from '../../../utils/ApiError.js';
import AadhaarProvider from './aadhaar.provider.js';

function unavailable() {
  throw new ApiError(503, 'Official Aadhaar verification integration is not configured', {
    code: 'AADHAAR_INTEGRATION_UNAVAILABLE',
  });
}

export default class ProductionAadhaarProvider extends AadhaarProvider {
  async initiateVerification() {
    return unavailable();
  }

  async verifyChallenge() {
    return unavailable();
  }

  async getVerifiedIdentity() {
    return unavailable();
  }
}
