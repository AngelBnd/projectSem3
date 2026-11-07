import { api } from "../../lib/api";
import type { ProductVariant } from "../../types";
import { buildProductSubmission } from "./productMappers";
import type { ProductInfo, SupplierOption } from "./types";
import type { ProductDetail } from "./productDetail";
import type { ProductFormResponse } from "./productEdit";

export interface Paginated<T> {
  items: T[];
  total: number;
}

// Every variant (no pagination), e.g. for dropdown/autofill data.
export const fetchProductVariants = () =>
  api.get<ProductVariant[]>("/api/product-variants");

// One page of variants. `page` is 0-based.
export const fetchProductVariantsPage = (page: number, pageSize: number) =>
  api.get<Paginated<ProductVariant>>(
    `/api/product-variants?page=${page}&pageSize=${pageSize}`
  );

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

export const fetchProductDetail = (variantId: number | string) =>
  api.get<ProductDetail>(`/api/products/variant/${variantId}`);

export const fetchProductForm = (variantId: number | string) =>
  api.get<ProductFormResponse>(`/api/products/variant/${variantId}/form`);

export const updateProduct = (productId: number, form: ProductInfo) =>
  api.putForm<{ productId: number; variantIds: number[] }>(
    `/api/products/${productId}`,
    buildProductSubmission(form)
  );
