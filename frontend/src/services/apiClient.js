const SESSION_KEY = "vaidyam.auth.session";

const getStoredSession = () => {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  try {
    if (session?.accessToken && session?.refreshToken) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // The app remains usable for the current page when storage is unavailable.
  }
};

export class ApiClientError extends Error {
  constructor(message, { status = 0, fields = [] } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.fields = fields;
  }
}

class ApiClient {
  constructor() {
    this.baseUrl = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");
    this.session = typeof window === "undefined" ? null : getStoredSession();
    this.refreshing = null;
  }

  getSession() {
    return this.session;
  }

  setSession(session) {
    this.session = session;
    saveSession(session);
  }

  clearSession() {
    this.setSession(null);
  }

  async refreshSession() {
    if (!this.session?.refreshToken) {
      throw new ApiClientError("Your session has ended. Please sign in again.", { status: 401 });
    }

    if (!this.refreshing) {
      this.refreshing = this.request("/auth/refresh", {
        method: "POST",
        body: { refreshToken: this.session.refreshToken },
        skipRefresh: true,
      })
        .then((data) => {
          this.setSession({
            ...this.session,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          return this.session;
        })
        .catch((error) => {
          this.clearSession();
          throw error;
        })
        .finally(() => {
          this.refreshing = null;
        });
    }

    return this.refreshing;
  }

  async request(path, { method = "GET", body, headers = {}, skipRefresh = false } = {}) {
    const requestHeaders = { ...headers };
    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
    if (this.session?.accessToken) requestHeaders.Authorization = `Bearer ${this.session.accessToken}`;

    let response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiClientError("We could not connect to Vaidyam. Please check your connection and try again.");
    }

    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.success !== false) return payload.data ?? payload;

    if (response.status === 401 && !skipRefresh && this.session?.refreshToken) {
      await this.refreshSession();
      return this.request(path, { method, body, headers, skipRefresh: true });
    }

    throw new ApiClientError(payload.message || "Something went wrong. Please try again.", {
      status: response.status,
      fields: payload.errors || [],
    });
  }

  get(path) { return this.request(path); }
  post(path, body) { return this.request(path, { method: "POST", body }); }
  patch(path, body) { return this.request(path, { method: "PATCH", body }); }
}

export const apiClient = new ApiClient();
