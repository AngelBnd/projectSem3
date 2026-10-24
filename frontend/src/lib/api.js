const BASE_URL = ""; // for seperate fe be deployment

async function request(path, options = {}, raw = false) {
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
    const error = new Error(body.error || `Request failed : ${response.status}`);
    error.status = response.status;
    error.data = body;
    throw error;
  }

  if (raw) {
    return response;
  }

  return response.json();
}

export const api = {
  get: (path, raw, headers) => request(path, { headers }, raw),
  post: (path, body, headers) =>
    request(path, { method: "POST", body: JSON.stringify(body), headers }),
  put: (path, body, headers) =>
    request(path, { method: "PUT", body: JSON.stringify(body), headers }),
  delete: (path, headers) => request(path, { method: "DELETE", headers }),
};
