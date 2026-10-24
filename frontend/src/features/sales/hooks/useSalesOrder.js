import { useEffect, useState } from "react";
import { fetchSalesOrder } from "../api";

export default function useSalesOrder(id) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetchSalesOrder(id).then(setOrder).catch(console.error);
  }, [id]);

  return order;
}
