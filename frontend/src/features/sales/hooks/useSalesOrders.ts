import { useQuery } from "@tanstack/react-query";
import { fetchSalesOrders } from "../api";

export default function useSalesOrders() {
  const query = useQuery({
    queryKey: ["salesOrders"],
    queryFn: fetchSalesOrders,
  });
  return {
    orders: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
