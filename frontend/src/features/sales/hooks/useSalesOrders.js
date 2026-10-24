import { useCallback, useEffect, useState } from "react";
import { fetchSalesOrders } from "../api";

export default function useSalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setOrders((await fetchSalesOrders()) || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, refetch };
}
