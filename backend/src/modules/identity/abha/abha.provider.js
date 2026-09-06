export default class AbhaProvider {
  async initiateAuthentication() {
    throw new Error('AbhaProvider.initiateAuthentication must be implemented by a provider');
  }

  async verifyAuthentication() {
    throw new Error('AbhaProvider.verifyAuthentication must be implemented by a provider');
  }

  async getVerifiedIdentity() {
    throw new Error('AbhaProvider.getVerifiedIdentity must be implemented by a provider');
  }
}
