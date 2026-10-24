import { api } from "../../lib/api";

export interface DashboardSummary {
  totalSales: number | string;
  totalRevenue: number | string;
  lowStockItems: number;
  totalCustomers: number;
}

export interface RecentTransaction {
  salesOrderId: number | string;
  customerName: string;
  orderDate: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface TopSellingProduct {
  productName: string;
  totalQuantitySold: number;
}

export const fetchDashboardSummary = () =>
  api.get<DashboardSummary>("/api/dashboard/summary");

export const fetchRecentTransactions = () =>
  api.get<RecentTransaction[]>("/api/dashboard/recent-transactions");

export const fetchTopSellingProducts = (period: string | null) =>
  api.get<TopSellingProduct[]>(
    `/api/dashboard/top-selling-products${period ? `?period=${period}` : ""}`
  );

// Returns the raw Response so the caller can read it as a blob.
export const exportDashboard = () =>
  api.get<Response>("/api/dashboard/export", true);
