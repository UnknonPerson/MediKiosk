import User from "../modules/users/user.model.js";
import { ACCOUNT_STATUS } from "../constants/roles.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(payload.userId).select(
      "+isDeleted"
    );

    if (!user || user.isDeleted) {
      throw new ApiError(401, "Authentication required");
    }

    if (
      user.accountStatus !== ACCOUNT_STATUS.ACTIVE ||
      !user.emailVerified
    ) {
      throw new ApiError(403, "This account is not active");
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
