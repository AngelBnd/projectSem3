import type { AuditInfo } from "./types";

/** What POST /api/stock-audits expects (backend/validators/stock-audits.validator.js). */
export const toAuditPayload = (form: AuditInfo) => ({
  auditName: form.auditName.trim(),
  auditDate: form.auditDate,
  notes: form.notes.trim(),
  items: form.items.map((item) => ({
    productVariantId: item.productVariantId,
    counted: Number(item.counted),
    reason: item.reason || null,
  })),
});
