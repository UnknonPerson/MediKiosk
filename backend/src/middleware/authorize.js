import ApiError from '../utils/ApiError.js';

export default function authorize(...allowedAccountTypes) {
  if (allowedAccountTypes.length === 0) {
    throw new TypeError('At least one account type is required for authorization');
  }

  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication is required', {
        code: 'AUTHENTICATION_REQUIRED',
      }));
    }

    if (!allowedAccountTypes.includes(req.user.accountType)) {
      return next(new ApiError(403, 'You are not authorized to access this resource', {
        code: 'AUTHORIZATION_DENIED',
      }));
    }

    return next();
  };
}
