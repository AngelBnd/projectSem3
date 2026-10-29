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

module.exports = { list, create };
