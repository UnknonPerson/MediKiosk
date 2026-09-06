import mongoose from 'mongoose';
import User from '../modules/users/user.model.js';
import { assertUserCanAuthenticate } from '../modules/auth/auth.service.js';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

function accessTokenFromHeader(req) {
  const authorization = req.get('authorization');

  if (!authorization) {
    throw new ApiError(401, 'Authentication is required', { code: 'AUTHENTICATION_REQUIRED' });
  }

  const [scheme, token, ...extra] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token || extra.length > 0) {
    throw new ApiError(401, 'Authorization header must use the Bearer scheme', {
      code: 'INVALID_AUTHORIZATION_HEADER',
    });
  }

  return token;
}

function invalidAccessToken(error) {
  const expired = error.name === 'TokenExpiredError';

  return new ApiError(401, expired ? 'Access token has expired' : 'Invalid access token', {
    code: expired ? 'ACCESS_TOKEN_EXPIRED' : 'INVALID_ACCESS_TOKEN',
  });
}

const authenticate = asyncHandler(async (req, res, next) => {
  const token = accessTokenFromHeader(req);
  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw invalidAccessToken(error);
  }

  if (!payload?.sub || !mongoose.isValidObjectId(payload.sub)) {
    throw new ApiError(401, 'Invalid access token', { code: 'INVALID_ACCESS_TOKEN' });
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, 'The authenticated account no longer exists', {
      code: 'AUTHENTICATED_USER_NOT_FOUND',
    });
  }

  assertUserCanAuthenticate(user);
  req.user = user.toSafeObject();
  next();
});

export default authenticate;
