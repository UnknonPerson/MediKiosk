import ApiError from '../../../utils/ApiError.js';
import AbhaProvider from './abha.provider.js';

function unavailable() {
  throw new ApiError(503, 'Official ABDM ABHA integration is not configured', {
    code: 'ABDM_ABHA_INTEGRATION_UNAVAILABLE',
  });
}

export default class AbdmAbhaProvider extends AbhaProvider {
  async initiateAuthentication() {
    return unavailable();
  }

  async verifyAuthentication() {
    return unavailable();
  }

  async getVerifiedIdentity() {
    return unavailable();
  }
}
