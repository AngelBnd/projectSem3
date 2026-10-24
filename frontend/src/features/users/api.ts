import { api } from "../../lib/api";
import type { ManagedUser } from "../../types";

export const fetchUsers = () => api.get<{ users: ManagedUser[] }>("/api/users");

export const approveUser = (userId: ManagedUser["userId"]) =>
  api.post(`/api/users/${userId}/approve`);

export const rejectUser = (userId: ManagedUser["userId"]) =>
  api.post<{ success: boolean; user: ManagedUser }>(
    `/api/users/${userId}/reject`
  );
