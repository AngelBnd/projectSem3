import { useQuery } from "@tanstack/react-query";
import { fetchSalesOrder, type OrderId } from "../api";

export default function useSalesOrder(id: OrderId | undefined) {
  return useQuery({
    queryKey: ["salesOrder", id],
    queryFn: () => fetchSalesOrder(id!),
    enabled: id !== undefined,
  });
}
