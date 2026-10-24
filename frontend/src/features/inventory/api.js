import { api } from "../../lib/api";

export const fetchInventoryCategories = () =>
  api.get("/api/inventory/categories");

export const fetchInventoryItems = () => api.get("/api/inventory/");

export const fetchFilteredInventory = ({ search, category } = {}) => {
  if (search) return searchInventory(search);

  const query =
    category && category !== "All"
      ? `?category=${encodeURIComponent(category)}`
      : "";
  return api.get(`/api/inventory${query}`);
};

export const searchInventory = (query) =>
  api.get(`/api/inventory/search?q=${encodeURIComponent(query)}`);

export const createInventoryItem = (item) => api.post("/api/inventory", item);

export const updateInventoryItem = (productCode, item) =>
  api.put(`/api/inventory/${productCode}`, item);

export const deleteInventoryItem = (productCode) =>
  api.delete(`/api/inventory/${encodeURIComponent(productCode)}`);
