import { api } from "../../lib/api";
import type { InventoryItem } from "../../types";

export type InventoryPayload = Record<string, unknown>;

export const fetchInventoryCategories = () =>
  api.get<string[]>("/api/inventory/categories");

export const fetchInventoryItems = () =>
  api.get<InventoryItem[]>("/api/inventory/");

export const searchInventory = (query: string) =>
  api.get<InventoryItem[]>(
    `/api/inventory/search?q=${encodeURIComponent(query)}`
  );

export const fetchFilteredInventory = ({
  search,
  category,
}: { search?: string; category?: string } = {}) => {
  if (search) return searchInventory(search);

  const query =
    category && category !== "All"
      ? `?category=${encodeURIComponent(category)}`
      : "";
  return api.get<InventoryItem[]>(`/api/inventory${query}`);
};

export const createInventoryItem = (item: InventoryPayload) =>
  api.post<{ message?: string }>("/api/inventory", item);

export const updateInventoryItem = (
  productCode: string,
  item: InventoryPayload
) => api.put<{ message?: string }>(`/api/inventory/${productCode}`, item);

export const deleteInventoryItem = (productCode: string) =>
  api.delete(`/api/inventory/${encodeURIComponent(productCode)}`);
