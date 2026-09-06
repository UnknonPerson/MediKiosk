import crypto from 'node:crypto';
import env from '../../../config/env.js';
import ApiError from '../../../utils/ApiError.js';
import {
  createMockChallenge,
  getVerifiedMockIdentity,
  verifyMockChallenge,
} from '../mockChallenge.store.js';
import AbhaProvider from './abha.provider.js';

function testIdentifier(identifier) {
  if (typeof identifier !== 'string' || !/^test-abha-[a-z0-9-]{3,64}$/i.test(identifier.trim())) {
    throw new ApiError(400, 'A mock ABHA test identifier is required', {
      code: 'INVALID_MOCK_ABHA_IDENTIFIER',
    });
  }

  return identifier.trim().toLowerCase();
}

function fakeIdentity(identifier) {
  const suffix = crypto.createHash('sha256').update(identifier, 'utf8').digest('hex').slice(0, 16);

  return {
    providerReference: `mock-abha-${suffix}`,
    abhaNumber: `MOCK-ABHA-${suffix.toUpperCase()}`,
    abhaAddress: `mock-${suffix}@abdm`,
    verificationMode: 'MOCK',
  };
}

function mockOnly() {
  if (!env.isDevelopment) {
    throw new ApiError(503, 'Mock ABHA provider is unavailable outside development', {
      code: 'ABHA_PROVIDER_UNAVAILABLE',
    });
  }
}

function logChallenge(transactionId, challenge) {
  if (!env.identity.mockLogCodes) return;

  console.info(JSON.stringify({
    level: 'warn',
    event: 'identity.mock_abha_challenge_generated',
    transactionId,
    challenge,
  }));
}

export default class MockAbhaProvider extends AbhaProvider {
  async initiateAuthentication({ userId, identifier }) {
    mockOnly();
    const transaction = createMockChallenge({
      provider: 'ABHA',
      userId,
      identity: fakeIdentity(testIdentifier(identifier)),
    });
    logChallenge(transaction.transactionId, transaction.challenge);

    return {
      success: true,
      provider: 'ABHA',
      transactionId: transaction.transactionId,
      verified: false,
    };
  }

  async verifyAuthentication({ userId, transactionId, challenge }) {
    mockOnly();
    const identity = verifyMockChallenge({
      provider: 'ABHA',
      userId,
      transactionId,
      challenge,
    });

    return {
      success: true,
      provider: 'ABHA',
      transactionId,
      verified: true,
      identity,
      verifiedAt: new Date(),
    };
  }

  async getVerifiedIdentity({ userId, transactionId }) {
    mockOnly();
    return getVerifiedMockIdentity({ provider: 'ABHA', userId, transactionId });
  }
}
