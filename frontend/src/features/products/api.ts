import { api } from "../../lib/api";
import type { ProductVariant } from "../../types";
import { buildProductSubmission } from "./productMappers";
import type { ProductInfo, SupplierOption } from "./types";

export const fetchProductVariants = () =>
  api.get<ProductVariant[]>("/api/product-variants");

export const quickAddProducts = () =>
  api.post("/api/product-variants/quick-add");

export const fetchSuppliers = async (): Promise<SupplierOption[]> => {
  const data =
    await api.get<{ supplierId: number; name: string }[]>("/api/suppliers");
  return data.map((s) => ({ id: s.supplierId, name: s.name }));
};

export const createProduct = (form: ProductInfo) =>
  api.postForm<{ productId: number; variants: number }>(
    "/api/products",
    buildProductSubmission(form)
  );
