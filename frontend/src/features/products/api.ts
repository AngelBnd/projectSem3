import { api } from "../../lib/api";
import type { ProductVariant } from "../../types";

export const fetchProductVariants = () =>
  api.get<ProductVariant[]>("/api/product-variants");

export const quickAddProducts = () => api.post("/api/product-variants/quick-add");
