import { api } from "../../lib/api";

export const fetchUsers = () => api.get("/api/users");

export const approveUser = (userId) => api.post(`/api/users/${userId}/approve`);

export const rejectUser = (userId) => api.post(`/api/users/${userId}/reject`);
