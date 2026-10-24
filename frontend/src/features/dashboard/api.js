import { api } from "../../lib/api";

export const fetchDashboardSummary = () => api.get("/api/dashboard/summary");

export const fetchRecentTransactions = () =>
  api.get("/api/dashboard/recent-transactions");

export const fetchTopSellingProducts = (period) =>
  api.get(
    `/api/dashboard/top-selling-products${period ? `?period=${period}` : ""}`
  );

// Returns the raw Response so the caller can read it as a blob.
export const exportDashboard = () => api.get("/api/dashboard/export", true);
