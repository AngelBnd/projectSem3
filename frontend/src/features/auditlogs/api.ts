import { api } from "../../lib/api";
import { toAuditPayload } from "./auditMappers";
import type { AuditInfo, AuditProduct, Paginated } from "./types";

export interface AuditProductQuery {
  search?: string;
  category?: string;
  page: number; // 0-based
  pageSize: number;
}

export const fetchAuditProducts = ({ search, category, page, pageSize }: AuditProductQuery) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  return api.get<Paginated<AuditProduct>>(`/api/stock-audits/products?${params}`);
};

/** Exact barcode or SKU match; rejects with a 404 ApiError when nothing matches. */
export const lookupAuditProduct = (code: string) =>
  api.get<AuditProduct>(`/api/stock-audits/lookup?code=${encodeURIComponent(code)}`);

export const createStockAudit = (form: AuditInfo) =>
  api.post<{ auditId: number; auditCode: string; adjusted: number }>(
    "/api/stock-audits",
    toAuditPayload(form),
  );
