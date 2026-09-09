import ApiError from "../utils/ApiError.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(
        new ApiError(
          400,
          "Validation failed",
          errors
        )
      );
    }

    req[source] = result.data;

    next();
  };
}