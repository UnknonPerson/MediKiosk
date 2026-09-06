import crypto from 'node:crypto';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import AbdmAbhaProvider from './abha/abdmAbha.provider.js';
import MockAbhaProvider from './abha/mockAbha.provider.js';
import MockAadhaarProvider from './aadhaar/mockAadhaar.provider.js';
import ProductionAadhaarProvider from './aadhaar/productionAadhaar.provider.js';
import Identity, { IDENTITY_PROVIDERS } from './identity.model.js';

const abhaProviders = Object.freeze({
  mock: new MockAbhaProvider(),
  abdm: new AbdmAbhaProvider(),
});

const aadhaarProviders = Object.freeze({
  mock: new MockAadhaarProvider(),
  production: new ProductionAadhaarProvider(),
});

function linkHashSecret() {
  if (!env.identity.linkHashSecret) {
    throw new ApiError(500, 'Identity linking service is not configured', {
      code: 'IDENTITY_CONFIGURATION_ERROR',
    });
  }

  return env.identity.linkHashSecret;
}

function referenceHash(provider, providerReference) {
  if (typeof providerReference !== 'string' || providerReference.length === 0) {
    throw new ApiError(502, 'Identity provider returned an invalid identity reference', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  return crypto
    .createHmac('sha256', linkHashSecret())
    .update(`${provider}:${providerReference}`, 'utf8')
    .digest('hex');
}

function linkConflict(code, message) {
  return new ApiError(409, message, { code });
}

function normalizeIdentityData(provider, identity) {
  if (!identity || typeof identity !== 'object') {
    throw new ApiError(502, 'Identity provider returned invalid identity data', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  if (provider === 'ABHA') {
    if (typeof identity.abhaNumber !== 'string' || identity.abhaNumber.length === 0) {
      throw new ApiError(502, 'Identity provider returned an invalid ABHA identity', {
        code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
      });
    }

    return {
      abhaNumber: identity.abhaNumber.slice(0, 128),
      abhaAddress: typeof identity.abhaAddress === 'string'
        ? identity.abhaAddress.slice(0, 256)
        : undefined,
    };
  }

  if (provider === 'AADHAAR') {
    if (typeof identity.maskedIdentifier !== 'string' || identity.maskedIdentifier.length === 0) {
      throw new ApiError(502, 'Identity provider returned an invalid Aadhaar identity', {
        code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
      });
    }

    return { maskedIdentifier: identity.maskedIdentifier.slice(0, 128) };
  }

  throw new ApiError(502, 'Identity provider returned an unknown identity type', {
    code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
  });
}

function normalizedVerification(provider, result) {
  if (!result?.success || result.provider !== provider || result.verified !== true || !result.identity) {
    throw new ApiError(502, 'Identity provider returned an invalid verification response', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  const verifiedAt = result.verifiedAt instanceof Date ? result.verifiedAt : new Date(result.verifiedAt);
  if (Number.isNaN(verifiedAt.getTime())) {
    throw new ApiError(502, 'Identity provider returned an invalid verification timestamp', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  return {
    provider,
    providerReference: result.identity.providerReference,
    identityData: normalizeIdentityData(provider, result.identity),
    verifiedAt,
    verificationMode: result.identity.verificationMode === 'OFFICIAL' ? 'OFFICIAL' : 'MOCK',
  };
}

function safeIdentity(identity, { alreadyLinked = false } = {}) {
  return {
    provider: identity.provider,
    verified: identity.verified,
    verifiedAt: identity.verifiedAt,
    ...(alreadyLinked ? { alreadyLinked: true } : {}),
  };
}

export function getAbhaProvider() {
  return abhaProviders[env.identity.abhaProvider];
}

export function getAadhaarProvider() {
  return aadhaarProviders[env.identity.aadhaarProvider];
}

export async function initiateAbhaVerification({ userId, identifier } = {}) {
  const result = await getAbhaProvider().initiateAuthentication({ userId, identifier });

  if (!result?.success || result.provider !== 'ABHA' || typeof result.transactionId !== 'string') {
    throw new ApiError(502, 'Identity provider returned an invalid initiation response', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  return { transactionId: result.transactionId };
}

export async function initiateAadhaarVerification({ userId, identifier } = {}) {
  const result = await getAadhaarProvider().initiateVerification({ userId, identifier });

  if (!result?.success || result.provider !== 'AADHAAR' || typeof result.transactionId !== 'string') {
    throw new ApiError(502, 'Identity provider returned an invalid initiation response', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  return { transactionId: result.transactionId };
}

export async function linkVerifiedIdentity({ userId, verification } = {}) {
  const normalized = normalizedVerification(verification?.provider, verification);
  if (!IDENTITY_PROVIDERS.includes(normalized.provider)) {
    throw new ApiError(502, 'Identity provider returned an unknown provider', {
      code: 'INVALID_IDENTITY_PROVIDER_RESPONSE',
    });
  }

  const providerReferenceId = referenceHash(normalized.provider, normalized.providerReference);
  const linkedIdentity = await Identity.findOne({
    provider: normalized.provider,
    providerReferenceId,
  });

  if (linkedIdentity) {
    if (linkedIdentity.userId.toString() !== userId.toString()) {
      throw linkConflict('IDENTITY_ALREADY_LINKED', 'This identity is already linked to another account');
    }

    return safeIdentity(linkedIdentity, { alreadyLinked: true });
  }

  const existingProviderIdentity = await Identity.findOne({
    userId,
    provider: normalized.provider,
  });
  if (existingProviderIdentity) {
    throw linkConflict('IDENTITY_PROVIDER_ALREADY_LINKED', 'An identity from this provider is already linked to this account');
  }

  try {
    const identity = await Identity.create({
      userId,
      provider: normalized.provider,
      providerReferenceId,
      identityData: normalized.identityData,
      verified: true,
      verifiedAt: normalized.verifiedAt,
      metadata: { verificationMode: normalized.verificationMode },
    });

    return safeIdentity(identity);
  } catch (error) {
    if (error?.code !== 11000) throw error;

    const racedIdentity = await Identity.findOne({
      provider: normalized.provider,
      providerReferenceId,
    });
    if (racedIdentity?.userId.toString() === userId.toString()) {
      return safeIdentity(racedIdentity, { alreadyLinked: true });
    }

    if (racedIdentity) {
      throw linkConflict('IDENTITY_ALREADY_LINKED', 'This identity is already linked to another account');
    }

    throw linkConflict('IDENTITY_PROVIDER_ALREADY_LINKED', 'An identity from this provider is already linked to this account');
  }
}

export async function verifyAbhaVerification({ userId, transactionId, challenge } = {}) {
  const result = await getAbhaProvider().verifyAuthentication({ userId, transactionId, challenge });
  return linkVerifiedIdentity({ userId, verification: result });
}

export async function verifyAadhaarVerification({ userId, transactionId, challenge } = {}) {
  const result = await getAadhaarProvider().verifyChallenge({ userId, transactionId, challenge });
  return linkVerifiedIdentity({ userId, verification: result });
}

export async function getUserIdentities(userId) {
  const identities = await Identity.find({ userId }).sort({ verifiedAt: -1 });
  return identities.map((identity) => safeIdentity(identity));
}
