import crypto from 'node:crypto';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

const transactions = new Map();

function challengeSecret() {
  if (!env.identity.mockChallengeSecret) {
    throw new ApiError(500, 'Mock identity provider is not configured', {
      code: 'IDENTITY_CONFIGURATION_ERROR',
    });
  }

  return env.identity.mockChallengeSecret;
}

function invalidChallenge(code = 'INVALID_IDENTITY_CHALLENGE') {
  return new ApiError(401, 'Invalid or expired verification challenge', { code });
}

function challengeHash(challenge) {
  return crypto.createHmac('sha256', challengeSecret()).update(challenge, 'utf8').digest('hex');
}

function generateChallenge() {
  let challenge = '';
  for (let index = 0; index < env.identity.challengeLength; index += 1) {
    challenge += crypto.randomInt(0, 10).toString();
  }

  return challenge;
}

function cleanExpiredTransactions(now = new Date()) {
  for (const [transactionId, transaction] of transactions) {
    if (transaction.expiresAt <= now) transactions.delete(transactionId);
  }
}

function validChallengeFormat(challenge) {
  return typeof challenge === 'string'
    && new RegExp(`^\\d{${env.identity.challengeLength}}$`).test(challenge);
}

function sameHash(left, right) {
  const first = Buffer.from(left, 'hex');
  const second = Buffer.from(right, 'hex');
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

export function createMockChallenge({ provider, userId, identity }) {
  cleanExpiredTransactions();
  const challenge = generateChallenge();
  const transactionId = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + (env.identity.challengeExpiryMinutes * 60 * 1000));

  transactions.set(transactionId, {
    provider,
    userId: userId.toString(),
    identity,
    challengeHash: challengeHash(challenge),
    expiresAt,
    attempts: 0,
    maxAttempts: env.identity.maxAttempts,
    verified: false,
  });

  return { transactionId, challenge, expiresAt };
}

export function verifyMockChallenge({ provider, userId, transactionId, challenge }) {
  const now = new Date();
  cleanExpiredTransactions(now);

  if (typeof transactionId !== 'string' || transactionId.length < 32 || !validChallengeFormat(challenge)) {
    throw invalidChallenge();
  }

  const transaction = transactions.get(transactionId);
  if (!transaction
    || transaction.provider !== provider
    || transaction.userId !== userId.toString()
    || transaction.verified
    || transaction.expiresAt <= now
    || transaction.attempts >= transaction.maxAttempts) {
    throw invalidChallenge(transaction?.attempts >= transaction?.maxAttempts
      ? 'IDENTITY_CHALLENGE_ATTEMPTS_EXCEEDED'
      : 'INVALID_IDENTITY_CHALLENGE');
  }

  if (!sameHash(transaction.challengeHash, challengeHash(challenge))) {
    transaction.attempts += 1;
    if (transaction.attempts >= transaction.maxAttempts) transactions.challengeHash = undefined;

    throw invalidChallenge(transaction.attempts >= transaction.maxAttempts
      ? 'IDENTITY_CHALLENGE_ATTEMPTS_EXCEEDED'
      : 'INVALID_IDENTITY_CHALLENGE');
  }

  transaction.verified = true;
  transaction.challengeHash = undefined;
  return transaction.identity;
}

export function getVerifiedMockIdentity({ provider, userId, transactionId }) {
  cleanExpiredTransactions();
  const transaction = transactions.get(transactionId);

  if (!transaction
    || transaction.provider !== provider
    || transaction.userId !== userId.toString()
    || !transaction.verified) {
    throw invalidChallenge();
  }

  return transaction.identity;
}
