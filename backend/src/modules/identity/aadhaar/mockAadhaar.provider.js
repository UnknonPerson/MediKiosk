import crypto from 'node:crypto';
import env from '../../../config/env.js';
import ApiError from '../../../utils/ApiError.js';
import {
  createMockChallenge,
  getVerifiedMockIdentity,
  verifyMockChallenge,
} from '../mockChallenge.store.js';
import AadhaarProvider from './aadhaar.provider.js';

function testIdentifier(identifier) {
  if (typeof identifier !== 'string' || !/^test-(?:aadhaar|identity)-[a-z0-9-]{3,64}$/i.test(identifier.trim())) {
    throw new ApiError(400, 'A mock Aadhaar test identifier is required', {
      code: 'INVALID_MOCK_AADHAAR_IDENTIFIER',
    });
  }

  return identifier.trim().toLowerCase();
}

function fakeIdentity(identifier) {
  const suffix = crypto.createHash('sha256').update(identifier, 'utf8').digest('hex').slice(0, 16);

  return {
    providerReference: `mock-aadhaar-${suffix}`,
    maskedIdentifier: `TEST-XXXX-${suffix.slice(-4).toUpperCase()}`,
    verificationMode: 'MOCK',
  };
}

function mockOnly() {
  if (!env.isDevelopment) {
    throw new ApiError(503, 'Mock Aadhaar provider is unavailable outside development', {
      code: 'AADHAAR_PROVIDER_UNAVAILABLE',
    });
  }
}

function logChallenge(transactionId, challenge) {
  if (!env.identity.mockLogCodes) return;

  console.info(JSON.stringify({
    level: 'warn',
    event: 'identity.mock_aadhaar_challenge_generated',
    transactionId,
    challenge,
  }));
}

export default class MockAadhaarProvider extends AadhaarProvider {
  async initiateVerification({ userId, identifier }) {
    mockOnly();
    const transaction = createMockChallenge({
      provider: 'AADHAAR',
      userId,
      identity: fakeIdentity(testIdentifier(identifier)),
    });
    logChallenge(transaction.transactionId, transaction.challenge);

    return {
      success: true,
      provider: 'AADHAAR',
      transactionId: transaction.transactionId,
      verified: false,
    };
  }

  async verifyChallenge({ userId, transactionId, challenge }) {
    mockOnly();
    const identity = verifyMockChallenge({
      provider: 'AADHAAR',
      userId,
      transactionId,
      challenge,
    });

    return {
      success: true,
      provider: 'AADHAAR',
      transactionId,
      verified: true,
      identity,
      verifiedAt: new Date(),
    };
  }

  async getVerifiedIdentity({ userId, transactionId }) {
    mockOnly();
    return getVerifiedMockIdentity({ provider: 'AADHAAR', userId, transactionId });
  }
}
