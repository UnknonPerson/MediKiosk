import ApiError from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, 'Route not found', { code: 'ROUTE_NOT_FOUND' }));
}

function normaliseError(error) {
  if (error.code === 11000) {
    return new ApiError(409, 'A record with that value already exists', { code: 'DUPLICATE_RECORD' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return new ApiError(400, 'Invalid request data', { code: 'INVALID_INPUT' });
  }

  if (error.type === 'entity.too.large') {
    return new ApiError(413, 'Request payload is too large', { code: 'PAYLOAD_TOO_LARGE' });
  }

  return error;
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  const resolvedError = normaliseError(error);
  const statusCode = Number.isInteger(resolvedError.statusCode) ? resolvedError.statusCode : 500;
  const message = resolvedError.isOperational ? resolvedError.message : 'Internal server error';

  console.error(JSON.stringify({
    level: 'error',
    event: 'request.failed',
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode,
    errorName: resolvedError.name,
    errorCode: resolvedError.code || 'INTERNAL_ERROR',
  }));

  const errorResponse = {
    code: resolvedError.isOperational ? resolvedError.code : 'INTERNAL_ERROR',
  };

  if (resolvedError.isOperational && resolvedError.details) {
    errorResponse.details = resolvedError.details;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorResponse,
    requestId: req.requestId,
  });
}
