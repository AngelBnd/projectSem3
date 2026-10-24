import { api } from "../../lib/api";

export const login = (credentials) => api.post("/api/auth/login", credentials);

export const register = (payload) => api.post("/api/auth/register", payload);

export const validateField = (field, value) =>
  api.post("/api/auth/validate", { field, value });
