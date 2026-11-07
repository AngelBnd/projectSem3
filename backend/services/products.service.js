const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const list = async (currentUser) => {
  console.log("CURRENT USER TEST", currentUser);

  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  return prisma.products.findMany({
    where: {
      storeId: currentUser.storeId,
    },
  });
};

/* ---------------------------- product details ---------------------------- */

const round1 = (n) => Math.round(n * 10) / 10;

const movementType = (m) => {
  if (m.referenceType === "ADJUSTMENT") return "Adjustment";
  return m.change >= 0 ? "Inbound" : "Outbound";
};

const titleCase = (s) =>
  s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Detail page: the variant that was opened, plus its product and sibling variants.
const getByVariant = async (currentUser, variantId) => {
  const { storeId } = currentUser;
  if (!storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const variant = await prisma.productVariants.findFirst({
    where: { productVariantId: variantId, storeId },
    include: { product: true, productVariantSuppliers: true },
  });
  if (!variant) {
    throw new HttpError(404, { error: "Product not found." });
  }

  const [siblings, movements] = await Promise.all([
    prisma.productVariants.findMany({
      where: { productId: variant.productId, storeId },
      orderBy: { productVariantId: "asc" },
      include: {
        productVariantAttributes: {
          include: { attributeValue: true },
        },
      },
    }),
    prisma.stockMovements.findMany({
      where: { productVariantId: variantId, storeId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Stock is never stored as a number: it is the sum of all movements.
  const available = movements.reduce((sum, m) => sum + m.change, 0);
  const sold = movements
    .filter((m) => m.change < 0 && ["INVOICE", "SALES_ORDER"].includes(m.referenceType))
    .reduce((sum, m) => sum - m.change, 0);

  const costs = variant.productVariantSuppliers.map((s) => Number(s.cost));
  const selling = Number(variant.sellingPrice);
  const minCost = costs.length ? Math.min(...costs) : null;
  const maxCost = costs.length ? Math.max(...costs) : null;
  const avgCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null;

  const margin =
    selling > 0 && minCost !== null
      ? {
          min: round1(((selling - maxCost) / selling) * 100),
          max: round1(((selling - minCost) / selling) * 100),
        }
      : null;

  const variants = siblings.map((v) => ({
    productVariantId: v.productVariantId,
    sku: v.sku,
    label:
      v.productVariantAttributes.map((a) => a.attributeValue.valueName).join(" / ") ||
      v.sku,
    image: v.image,
  }));

  return {
    productId: variant.productId,
    productName: variant.product.productName,
    productDescription: variant.product.productDescription,
    category: variant.product.category,
    brand: variant.product.brand,
    createdAt: variant.product.createdAt,
    updatedAt: variant.product.updatedAt,
    variants,
    images: variants.filter((v) => v.image).map((v) => v.image),
    variant: {
      productVariantId: variant.productVariantId,
      sku: variant.sku,
      barcode: variant.barcode,
      productStatus: variant.productStatus,
      sellingPrice: selling,
      purchasePrice: minCost === null ? null : { min: minCost, max: maxCost },
      margin,
      stock: {
        available,
        reserved: null, // no reservation data is stored yet
        sold,
        value: avgCost === null ? null : Math.round(available * avgCost),
      },
    },
    activity: movements.slice(0, 100).map((m) => ({
      id: m.stockMovementId,
      date: m.createdAt,
      type: movementType(m),
      qty: m.change,
      reason: m.reason,
      description: m.referenceId
        ? `${titleCase(m.referenceType)} #${m.referenceId}`
        : titleCase(m.referenceType),
    })),
  };
};

/* ---------------------------- create product ---------------------------- */

const can = (user, module, permission) =>
  (user.userRoles ?? []).some((ur) =>
    (ur.role?.rolePermissions ?? []).some(
      (rp) => rp.permission?.module === module && rp.permission?.permission === permission
    )
  );

const pairKey = (name, value) => `${name.trim().toLowerCase()}::${value.trim().toLowerCase()}`;

// MySQL compares strings case-insensitively by default, so a plain `equals`
// already matches "color" with "Color".
const findOrCreateAttributeValue = async (tx, storeId, name, value) => {
  const attribute =
    (await tx.attributes.findFirst({ where: { storeId, name: name.trim() } })) ??
    (await tx.attributes.create({ data: { storeId, name: name.trim() } }));

  const attributeValue =
    (await tx.attributeValues.findFirst({
      where: { storeId, attributeId: attribute.attributeId, valueName: value.trim() },
    })) ??
    (await tx.attributeValues.create({
      data: { storeId, attributeId: attribute.attributeId, valueName: value.trim() },
    }));

  return attributeValue.attributeValuesId;
};

// Existing supplier (by id, only if it belongs to this store, or by name), else create it.
const resolveSupplierId = async (tx, storeId, { supplierId, supplierName }) => {
  if (supplierId) {
    const byId = await tx.suppliers.findFirst({ where: { supplierId, storeId } });
    if (byId) return byId.supplierId;
  }
  const name = supplierName.trim();
  const byName = await tx.suppliers.findFirst({ where: { storeId, name } });
  if (byName) return byName.supplierId;
  return (await tx.suppliers.create({ data: { storeId, name } })).supplierId;
};

const create = async (currentUser, input, imageUrls = {}) => {
  const { storeId, userId } = currentUser;

  if (!storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }
  if (!can(currentUser, "product", "create")) {
    throw new HttpError(403, { error: "You do not have permission to create products." });
  }

  // Users who may approve products publish directly; everyone else waits for approval.
  const approvalStatus = can(currentUser, "product", "approve") ? "APPROVED" : "PENDING";

  // Exactly one default variant: the first one flagged, otherwise the first one.
  const flagged = input.variants.findIndex((v) => v.isDefault);
  const defaultIndex = flagged === -1 ? 0 : flagged;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const product = await tx.products.create({
          data: {
            storeId,
            createdBy: userId,
            productName: input.productName,
            productDescription: input.productDescription || null,
            category: input.category,
            brand: input.brand,
            productStatus: input.productStatus,
            approvalStatus,
          },
        });

        // Resolve every distinct (attribute, value) pair once.
        const valueIds = new Map();
        for (const v of input.variants) {
          for (const a of v.attributes) {
            const key = pairKey(a.name, a.value);
            if (!valueIds.has(key)) {
              valueIds.set(key, await findOrCreateAttributeValue(tx, storeId, a.name, a.value));
            }
          }
        }

        for (const [i, v] of input.variants.entries()) {
          // Suppliers first, so a brand-new one exists before its link row.
          const supplierRows = [];
          let openingStock = 0;
          for (const line of v.suppliers) {
            const supplierId = await resolveSupplierId(tx, storeId, line);
            supplierRows.push({ storeId, supplierId, cost: line.cost });
            openingStock += line.stock;
          }

          const variant = await tx.productVariants.create({
            data: {
              storeId,
              productId: product.productId,
              sku: v.sku,
              barcode: v.barcode || null,
              sellingPrice: v.sellingPrice,
              thresholdStock: v.thresholdStock,
              productStatus: v.productStatus,
              isDefault: i === defaultIndex,
              image: (v.imageRef && imageUrls[v.imageRef]) || v.imageUrl || null,
              productVariantAttributes: {
                create: v.attributes.map((a) => ({
                  storeId,
                  attributeValuesId: valueIds.get(pairKey(a.name, a.value)),
                })),
              },
              productVariantSuppliers: { create: supplierRows },
            },
          });

          // Opening stock is recorded as a movement; stock is never stored as a number.
          if (openingStock > 0) {
            await tx.stockMovements.create({
              data: {
                storeId,
                productVariantId: variant.productVariantId,
                referenceType: "ADJUSTMENT",
                referenceId: null,
                change: openingStock,
                reason: "Opening stock",
              },
            });
          }
        }

        return { productId: product.productId, variants: input.variants.length };
      },
      { timeout: 20000 } // many sequential queries; the 5s default can be too short
    );
  } catch (error) {
    if (error.code === "P2002") {
      throw new HttpError(409, {
        error: "A SKU or supplier with the same name already exists in this store.",
      });
    }
    throw error;
  }
};

/* ---------------------------- edit product ---------------------------- */

// Everything the edit form needs: the whole product with its live (non-discontinued) variants.
const getFormByVariant = async (currentUser, variantId) => {
  const { storeId } = currentUser;
  if (!storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const anchor = await prisma.productVariants.findFirst({
    where: { productVariantId: variantId, storeId },
    select: { productId: true },
  });
  if (!anchor) {
    throw new HttpError(404, { error: "Product not found." });
  }

  const product = await prisma.products.findFirst({
    where: { productId: anchor.productId, storeId },
    include: {
      variants: {
        where: { NOT: { productStatus: "DISCONTINUED" } },
        orderBy: { productVariantId: "asc" },
        include: {
          productVariantAttributes: {
            orderBy: { productVariantAttributeId: "asc" },
            include: { attributeValue: { include: { attribute: true } } },
          },
          productVariantSuppliers: {
            orderBy: { productVariantSupplierId: "asc" },
            include: { supplier: true },
          },
        },
      },
    },
  });

  return {
    productId: product.productId,
    productName: product.productName,
    productDescription: product.productDescription,
    category: product.category,
    brand: product.brand,
    productStatus: product.productStatus,
    variants: product.variants.map((v) => ({
      productVariantId: v.productVariantId,
      sku: v.sku,
      barcode: v.barcode,
      sellingPrice: v.sellingPrice.toString(),
      thresholdStock: v.thresholdStock,
      productStatus: v.productStatus,
      isDefault: v.isDefault,
      image: v.image,
      attributes: v.productVariantAttributes.map((a) => ({
        name: a.attributeValue.attribute.name,
        value: a.attributeValue.valueName,
      })),
      suppliers: v.productVariantSuppliers.map((s) => ({
        supplierId: s.supplierId,
        supplierName: s.supplier.name,
        cost: s.cost.toString(),
      })),
    })),
  };
};

/**
 * Edits a product: its details, and per variant the SKU, barcode, price, threshold,
 * status, image, attributes and suppliers. Stock is NEVER touched here; it only
 * changes through stock movements.
 *
 * A payload variant is matched to an existing one by `productVariantId`, else by SKU.
 * Existing variants that are not in the payload are kept for their history but set
 * to DISCONTINUED. Payload variants that match nothing are created (with no stock).
 */
const update = async (currentUser, productId, input, imageUrls = {}) => {
  const { storeId } = currentUser;

  if (!storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }
  if (!can(currentUser, "product", "update")) {
    throw new HttpError(403, { error: "You do not have permission to edit products." });
  }

  const flagged = input.variants.findIndex((v) => v.isDefault);
  const defaultIndex = flagged === -1 ? 0 : flagged;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const product = await tx.products.findFirst({
          where: { productId, storeId },
          include: { variants: true },
        });
        if (!product) {
          throw new HttpError(404, { error: "Product not found." });
        }

        await tx.products.update({
          where: { productId },
          data: {
            productName: input.productName,
            productDescription: input.productDescription || null,
            category: input.category,
            brand: input.brand,
            productStatus: input.productStatus,
          },
        });

        // Resolve every distinct (attribute, value) pair once.
        const valueIds = new Map();
        for (const v of input.variants) {
          for (const a of v.attributes) {
            const key = pairKey(a.name, a.value);
            if (!valueIds.has(key)) {
              valueIds.set(key, await findOrCreateAttributeValue(tx, storeId, a.name, a.value));
            }
          }
        }

        const byId = new Map(product.variants.map((v) => [v.productVariantId, v]));
        const bySku = new Map(product.variants.map((v) => [v.sku.toLowerCase(), v]));
        const keptIds = new Set();

        for (const [i, v] of input.variants.entries()) {
          const current =
            (v.productVariantId && byId.get(v.productVariantId)) ||
            bySku.get(v.sku.trim().toLowerCase());

          if (current && keptIds.has(current.productVariantId)) {
            throw new HttpError(400, { error: `Variant "${v.sku}" is listed twice.` });
          }

          // Suppliers first, so a brand-new one exists before its link row.
          const supplierRows = [];
          for (const line of v.suppliers) {
            const supplierId = await resolveSupplierId(tx, storeId, line);
            supplierRows.push({ supplierId, cost: line.cost });
          }

          const fields = {
            sku: v.sku,
            barcode: v.barcode || null,
            sellingPrice: v.sellingPrice,
            thresholdStock: v.thresholdStock,
            productStatus: v.productStatus,
            isDefault: i === defaultIndex,
            image: (v.imageRef && imageUrls[v.imageRef]) || v.imageUrl || null,
          };
          const attributeLinks = v.attributes.map((a) => ({
            storeId,
            attributeValuesId: valueIds.get(pairKey(a.name, a.value)),
          }));

          if (!current) {
            const created = await tx.productVariants.create({
              data: {
                storeId,
                productId,
                ...fields,
                productVariantAttributes: { create: attributeLinks },
                productVariantSuppliers: {
                  create: supplierRows.map((s) => ({ storeId, ...s })),
                },
              },
            });
            keptIds.add(created.productVariantId);
            continue;
          }

          const id = current.productVariantId;
          keptIds.add(id);

          await tx.productVariants.update({ where: { productVariantId: id }, data: fields });

          // attributes: replace the links
          await tx.productVariantAttributes.deleteMany({ where: { productVariantsId: id } });
          if (attributeLinks.length) {
            await tx.productVariantAttributes.createMany({
              data: attributeLinks.map((l) => ({ ...l, productVariantsId: id })),
            });
          }

          // suppliers: drop the ones that are gone, add or update the rest
          await tx.productVariantSuppliers.deleteMany({
            where: {
              productVariantId: id,
              supplierId: { notIn: supplierRows.map((s) => s.supplierId) },
            },
          });
          for (const row of supplierRows) {
            await tx.productVariantSuppliers.upsert({
              where: {
                productVariantId_supplierId: {
                  productVariantId: id,
                  supplierId: row.supplierId,
                },
              },
              create: { storeId, productVariantId: id, supplierId: row.supplierId, cost: row.cost },
              update: { cost: row.cost },
            });
          }
        }

        // Variants the form no longer has: keep their history, take them out of use.
        await tx.productVariants.updateMany({
          where: { productId, storeId, productVariantId: { notIn: [...keptIds] } },
          data: { productStatus: "DISCONTINUED", isDefault: false },
        });

        return { productId, variantIds: [...keptIds] };
      },
      { timeout: 20000 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      throw new HttpError(409, {
        error: "A SKU or supplier with the same name already exists in this store.",
      });
    }
    throw error;
  }
};

module.exports = { list, create, getByVariant, getFormByVariant, update };
