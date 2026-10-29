import { useQuery } from "@tanstack/react-query";
import { fetchSalesOrders } from "../api";
import type { SalesOrderSummary } from "../../../types";

const EMPTY_SALES_ORDERS: SalesOrderSummary[] = [];

export default function useSalesOrders() {
  const query = useQuery({
    queryKey: ["salesOrders"],
    queryFn: fetchSalesOrders,
  });
  return {
    orders: query.data ?? EMPTY_SALES_ORDERS,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
