import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import ApiError from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(
    new ApiError(
      404,
      "Route not found: " + req.method + " " + req.originalUrl
    )
  );
}

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiError(
      400,
      "Validation failed",
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  if (error?.name === "ValidationError") {
    return new ApiError(
      400,
      "Validation failed",
      Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      }))
    );
  }

  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern || error.keyValue || {});

    return new ApiError(
      409,
      "A record with this value already exists",
      fields.map((field) => ({
        field,
        message: field + " already exists",
      }))
    );
  }

  if (
    error instanceof jwt.TokenExpiredError ||
    error?.name === "TokenExpiredError"
  ) {
    return new ApiError(401, "Token has expired");
  }

  if (
    error instanceof jwt.JsonWebTokenError ||
    error?.name === "JsonWebTokenError"
  ) {
    return new ApiError(401, "Invalid token");
  }

  return new ApiError(500, "Internal server error");
}

export function errorHandler(err, req, res, next) {
  const error = normalizeError(err);

  if (!(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
  });
}
