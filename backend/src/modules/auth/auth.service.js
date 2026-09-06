import User from '../users/user.model.js';
import ApiError from '../../utils/ApiError.js';
import {
  accessTokenExpiresIn,
  generateAccessToken,
  revokeSession,
  rotateRefreshToken,
} from './token.service.js';

const BLOCKED_AUTH_STATUSES = new Set(['REJECTED', 'SUSPENDED']);

export function assertUserCanAuthenticate(user) {
  if (!user || BLOCKED_AUTH_STATUSES.has(user.status)) {
    throw new ApiError(403, 'This account is not permitted to authenticate', {
      code: 'ACCOUNT_ACCESS_DENIED',
    });
  }
}

export async function refreshAuthentication(refreshToken, requestMetadata) {
  const rotation = await rotateRefreshToken(refreshToken, requestMetadata);
  const user = await User.findById(rotation.userId);

  if (!user) {
    throw new ApiError(401, 'Invalid or expired refresh token', {
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  assertUserCanAuthenticate(user);

  return {
    accessToken: generateAccessToken(user),
    refreshToken: rotation.refreshToken,
    accessTokenExpiresIn,
  };
}

export async function logout(refreshToken) {
  await revokeSession(refreshToken);
}
