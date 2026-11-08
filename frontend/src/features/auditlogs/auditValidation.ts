import { itemDiff, type AuditInfo } from "./types";

/** Every reason the audit cannot be sent yet; empty when it is valid. */
export function validateAudit(form: AuditInfo): string[] {
  const errors: string[] = [];

  if (!form.auditName.trim()) errors.push("Audit name is required.");
  if (!form.auditDate) errors.push("Date is required.");
  if (!form.items.length) errors.push("Add at least one product to the audit.");

  if (form.items.some((i) => i.counted === "")) {
    errors.push("Enter a counted quantity for every product.");
  }
  if (form.items.some((i) => (itemDiff(i) ?? 0) !== 0 && !i.reason)) {
    errors.push("Pick a reason for every product whose count differs.");
  }

  return errors;
}
