export default class AadhaarProvider {
  async initiateVerification() {
    throw new Error('AadhaarProvider.initiateVerification must be implemented by a provider');
  }

  async verifyChallenge() {
    throw new Error('AadhaarProvider.verifyChallenge must be implemented by a provider');
  }

  async getVerifiedIdentity() {
    throw new Error('AadhaarProvider.getVerifiedIdentity must be implemented by a provider');
  }
}
