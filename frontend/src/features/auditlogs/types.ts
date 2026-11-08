import type { Dispatch, SetStateAction } from "react";
import type { TagTone } from "../../components/globalComponents/ColorTag";

/** Mirrors the backend StockAdjustmentReason enum. */
export type AdjustmentReason =
  | "DAMAGED"
  | "MISCOUNT"
  | "SUPPLIER_ERROR"
  | "UNRECORDED_SALE"
  | "UNRECORDED_RECEIPT"
  | "OTHER";

export const ADJUSTMENT_REASONS: {
  value: AdjustmentReason;
  label: string;
  tone: TagTone;
}[] = [
  { value: "DAMAGED", label: "Damaged", tone: "red" },
  { value: "MISCOUNT", label: "Miscount", tone: "yellow" },
  { value: "SUPPLIER_ERROR", label: "Supplier Error", tone: "blue" },
  { value: "UNRECORDED_SALE", label: "Unrecorded Sale", tone: "purple" },
  { value: "UNRECORDED_RECEIPT", label: "Unrecorded Receipt", tone: "green" },
  { value: "OTHER", label: "Other", tone: "gray" },
];

export type AdjustmentMethod = "manual" | "scan";

/** A variant as the audit endpoints return it (GET /api/stock-audits/products, /lookup). */
export interface AuditProduct {
  productVariantId: number;
  productName: string;
  variantLabel: string;
  sku: string;
  barcode: string | null;
  category: string;
  stock: number;
}

/** One row of the audit: a product, what was counted, and why it differs. */
export interface AuditItem {
  productVariantId: number;
  productName: string;
  variantLabel: string;
  sku: string;
  /** Stock on record when the row was added; the server re-reads it on submit. */
  inStock: number;
  /** "" until the user types a count. */
  counted: number | "";
  reason: AdjustmentReason | "";
}

export interface AuditInfo {
  auditName: string;
  /** yyyy-mm-dd, as an <input type="date"> holds it */
  auditDate: string;
  notes: string;
  method: AdjustmentMethod;
  items: AuditItem[];
}

export interface AuditStepProps {
  formData: AuditInfo;
  setFormData: Dispatch<SetStateAction<AuditInfo>>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

/** counted − in stock, or null while the count is still empty. */
export const itemDiff = (item: AuditItem): number | null =>
  item.counted === "" ? null : item.counted - item.inStock;

export const formatDiff = (diff: number | null) =>
  diff === null ? "—" : diff > 0 ? `+${diff}` : String(diff);

export const toAuditItem = (p: AuditProduct, counted: number | "" = ""): AuditItem => ({
  productVariantId: p.productVariantId,
  productName: p.productName,
  variantLabel: p.variantLabel,
  sku: p.sku,
  inStock: p.stock,
  counted,
  reason: "",
});
