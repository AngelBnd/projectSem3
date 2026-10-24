import { useEffect, useState } from "react";
import { fetchSalesOrder, type OrderId } from "../api";
import type { SalesOrderDetail } from "../../../types";

export default function useSalesOrder(id: OrderId | undefined) {
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchSalesOrder(id).then(setOrder).catch(console.error);
  }, [id]);

  return order;
}
