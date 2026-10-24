import { api } from "../../lib/api";
import type { AuthUser } from "../../types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const login = (credentials: LoginCredentials) =>
  api.post<LoginResponse>("/api/auth/login", credentials);

export const register = (payload: Record<string, unknown>) =>
  api.post("/api/auth/register", payload);

export const validateField = (field: "email" | "storeTag", value: string) =>
  api.post("/api/auth/validate", { field, value });
