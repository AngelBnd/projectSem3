const BASE_URL = ""; // for seperate fe be deployment

type Headers = Record<string, string>;

/** Error thrown for non-2xx responses; carries the parsed JSON body. */
export class ApiError extends Error {
  status: number;
  data: { error?: string; message?: string; [key: string]: unknown };

  constructor(message: string, status: number, data: ApiError["data"]) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(
  path: string,
  options: { method?: string; body?: string; headers?: Headers } = {},
  raw = false
): Promise<any> {
  const token = localStorage.getItem("token");

  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isAuthRoute = path.startsWith("/api/auth/");

  if (!isAuthRoute && (response.status === 401 || response.status === 403)) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session Expired");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.error || `Request failed : ${response.status}`,
      response.status,
      body
    );
  }

  if (raw) {
    return response;
  }

  return response.json();
}

export const api = {
  get: <T = any>(path: string, raw = false, headers?: Headers): Promise<T> =>
    request(path, { headers }, raw),
  post: <T = any>(path: string, body?: unknown, headers?: Headers): Promise<T> =>
    request(path, { method: "POST", body: JSON.stringify(body), headers }),
  put: <T = any>(path: string, body?: unknown, headers?: Headers): Promise<T> =>
    request(path, { method: "PUT", body: JSON.stringify(body), headers }),
  delete: <T = any>(path: string, headers?: Headers): Promise<T> =>
    request(path, { method: "DELETE", headers }),
};

export const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);
