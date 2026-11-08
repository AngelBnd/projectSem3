const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const requireStore = (currentUser) => {
  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }
  return currentUser.storeId;
};

// AUD-2026-007: the year the audit is dated plus its id.
const auditCode = (audit) =>
  `AUD-${new Date(audit.auditDate).getFullYear()}-${String(audit.auditId).padStart(3, "0")}`;

const REASON_LABELS = {
  DAMAGED: "Damaged",
  MISCOUNT: "Miscount",
  SUPPLIER_ERROR: "Supplier error",
  UNRECORDED_SALE: "Unrecorded sale",
  UNRECORDED_RECEIPT: "Unrecorded receipt",
  OTHER: "Other",
};

// Stock is never stored as a number: it is the sum of all movements.
const stockByVariant = async (client, storeId, variantIds) => {
  if (!variantIds.length) return new Map();
  const sums = await client.stockMovements.groupBy({
    by: ["productVariantId"],
    where: { storeId, productVariantId: { in: variantIds } },
    _sum: { change: true },
  });
  return new Map(sums.map((s) => [s.productVariantId, s._sum.change ?? 0]));
};

const variantInclude = {
  product: { select: { productName: true, category: true } },
  productVariantAttributes: { include: { attributeValue: true } },
};

const toAuditProduct = (v, stock) => ({
  productVariantId: v.productVariantId,
  productName: v.product.productName,
  variantLabel: v.productVariantAttributes.map((a) => a.attributeValue.valueName).join(" / "),
  sku: v.sku,
  barcode: v.barcode,
  category: v.product.category,
  stock: stock.get(v.productVariantId) ?? 0,
});

/* ------------------------- products to pick from ------------------------- */

// Paginated variants (with current stock) for the "Add products" dialog.
const listProducts = async (currentUser, { search, category, page, pageSize }) => {
  const storeId = requireStore(currentUser);

  const where = {
    storeId,
    ...(category && { product: { category } }),
    ...(search && {
      OR: [
        { sku: { contains: search } },
        { barcode: { contains: search } },
        { product: { productName: { contains: search } } },
      ],
    }),
  };

  const [variants, total] = await Promise.all([
    prisma.productVariants.findMany({
      where,
      include: variantInclude,
      orderBy: { productVariantId: "asc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.productVariants.count({ where }),
  ]);

  const stock = await stockByVariant(
    prisma,
    storeId,
    variants.map((v) => v.productVariantId)
  );
  return { items: variants.map((v) => toAuditProduct(v, stock)), total };
};

// Exact barcode or SKU match, used by scan mode.
const lookupByCode = async (currentUser, code) => {
  const storeId = requireStore(currentUser);

  const variant = await prisma.productVariants.findFirst({
    where: { storeId, OR: [{ barcode: code }, { sku: code }] },
    include: variantInclude,
  });
  if (!variant) {
    throw new HttpError(404, { error: `No product found for "${code}".` });
  }

  const stock = await stockByVariant(prisma, storeId, [variant.productVariantId]);
  return toAuditProduct(variant, stock);
};

/* ------------------------------ create audit ----------------------------- */

// Saves the audit and books every difference as an ADJUSTMENT stock movement,
// so the counted quantity becomes the new stock.
const create = async (currentUser, body) => {
  const storeId = requireStore(currentUser);
  const variantIds = body.items.map((i) => i.productVariantId);

  return prisma.$transaction(async (tx) => {
    const found = await tx.productVariants.findMany({
      where: { storeId, productVariantId: { in: variantIds } },
      select: { productVariantId: true },
    });
    if (found.length !== variantIds.length) {
      throw new HttpError(400, { error: "Some products no longer exist in this store." });
    }

    // The quantity on record right now, not what the browser saw when the row was added.
    const stock = await stockByVariant(tx, storeId, variantIds);
    const lines = body.items.map((it) => {
      const systemQuantity = stock.get(it.productVariantId) ?? 0;
      return { ...it, systemQuantity, diff: it.counted - systemQuantity };
    });

    const missingReason = lines.findIndex((l) => l.diff !== 0 && !l.reason);
    if (missingReason !== -1) {
      throw new HttpError(400, {
        error: "Pick a reason for every product whose count differs.",
        details: [
          {
            path: `items.${missingReason}.reason`,
            message: "Pick a reason for every product whose count differs.",
          },
        ],
      });
    }

    const audit = await tx.stockAudits.create({
      data: {
        storeId,
        doneBy: currentUser.userId,
        auditName: body.auditName,
        auditDate: new Date(body.auditDate),
        notes: body.notes,
        status: "COMPLETED",
        difference: lines.reduce((sum, l) => sum + l.diff, 0),
      },
    });

    await tx.stockAdjustmentPerProduct.createMany({
      data: lines.map((l) => ({
        auditId: audit.auditId,
        productVariantId: l.productVariantId,
        physicalQuantity: l.counted,
        systemQuantity: l.systemQuantity,
        reason: l.diff === 0 ? null : l.reason,
      })),
    });

    const adjustments = lines.filter((l) => l.diff !== 0);
    if (adjustments.length) {
      await tx.stockMovements.createMany({
        data: adjustments.map((l) => ({
          storeId,
          productVariantId: l.productVariantId,
          referenceType: "ADJUSTMENT",
          referenceId: audit.auditId,
          change: l.diff,
          reason: `Stock audit: ${REASON_LABELS[l.reason]}`,
        })),
      });
    }

    return {
      auditId: audit.auditId,
      auditCode: auditCode(audit),
      adjusted: adjustments.length,
    };
  });
};

module.exports = { listProducts, lookupByCode, create };
