import { apiClient } from "../../../services/apiClient";

export const authApi = {
  register: (payload) => apiClient.post("/auth/register", payload),
  verifyEmail: (payload) => apiClient.post("/auth/verify-email", payload),
  resendVerification: (email) => apiClient.post("/auth/resend-verification-otp", { email }),
  login: async (payload) => {
    const data = await apiClient.post("/auth/login", payload);
    apiClient.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.user;
  },
  logout: async () => {
    const refreshToken = apiClient.getSession()?.refreshToken;
    try {
      if (refreshToken) await apiClient.post("/auth/logout", { refreshToken });
    } finally {
      apiClient.clearSession();
    }
  },
  me: () => apiClient.get("/auth/me").then((data) => data.user),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  verifyPasswordResetOtp: (payload) => apiClient.post("/auth/verify-password-reset-otp", payload),
  resetPassword: (payload) => apiClient.post("/auth/reset-password", payload),
};
