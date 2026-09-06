import ApiError from '../utils/ApiError.js';

/**
 * Restricts an already-authenticated account to explicit lifecycle states.
 * Keep this separate from authentication so pending accounts can be granted
 * only the narrowly scoped routes that are safe for their current workflow.
 */
export default function requireAccountStatus(...allowedStatuses) {
  if (allowedStatuses.length === 0) {
    throw new TypeError('At least one account status is required');
  }

  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication is required', {
        code: 'AUTHENTICATION_REQUIRED',
      }));
    }

    if (!allowedStatuses.includes(req.user.status)) {
      return next(new ApiError(403, 'This account status cannot access this resource', {
        code: 'ACCOUNT_STATUS_NOT_ALLOWED',
      }));
    }

    return next();
  };
}
