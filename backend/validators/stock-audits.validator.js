const { z } = require("zod");
const { StockAdjustmentReason } = require("@prisma/client");

// Shape comes from the frontend's toAuditPayload (features/auditlogs/auditMappers.ts).
// The system quantity is never sent: the server reads it from the stock movements.
const item = z.object({
  productVariantId: z
    .number({ error: "items[].productVariantId must be a number" })
    .int()
    .positive(),
  counted: z
    .number({ error: "Every product needs a counted quantity" })
    .int("Counted quantities must be whole numbers")
    .min(0, "Counted quantities cannot be negative"),
  reason: z
    .enum(Object.values(StockAdjustmentReason), {
      error: "items[].reason is invalid",
    })
    .nullish(),
});

const create = z
  .object({
    auditName: z
      .string({ error: "Audit name is required" })
      .trim()
      .min(1, "Audit name is required")
      .max(191),
    auditDate: z
      .string({ error: "Date is required" })
      .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Date is invalid" }),
    notes: z.string().trim().max(5000).default(""),
    items: z.array(item).min(1, "Add at least one product to the audit"),
  })
  .superRefine((body, ctx) => {
    const seen = new Set();
    body.items.forEach((it, i) => {
      if (seen.has(it.productVariantId)) {
        ctx.addIssue({
          code: "custom",
          message: "A product is listed twice in the audit",
          path: ["items", i, "productVariantId"],
        });
      }
      seen.add(it.productVariantId);
    });
  });

module.exports = { create };
