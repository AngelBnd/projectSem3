const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const list = async (currentUser) => {
  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const variants = await prisma.productVariants.findMany({
    where: {
      storeId: currentUser.storeId,
    },
    include: {
      product: true,
      productVariantAttributes: {
        include: {
          attributeValue: {
            include: {
              attribute: true,
            },
          },
        },
      },
    },
    orderBy: {
      productVariantId: "asc",
    },
  });

  const formatted = variants.map((v) => {
    const attrValues = v.productVariantAttributes
      .map((pva) => pva.attributeValue?.valueName)
      .filter(Boolean);

    const sortedAttributes = v.productVariantAttributes
      .sort((a, b) =>
        a.attributeValue.attribute.name.localeCompare(
          b.attributeValue.attribute.name
        )
      )
      .map((pva) => pva.attributeValue.valueName);

    const variantName = [v.product?.productName, ...sortedAttributes]
      .join(" ")
      .trim();

    return {
      productVariantId: v.productVariantId,
      productId: v.productId,

      sku: v.sku,
      barcode: v.barcode,

      productName: v.product?.productName || "",
      variantName: variantName,

      sellingPrice: v.sellingPrice ?? 0,
      costPrice: v.costPrice ?? 0,
      thresholdStock: v.thresholdStock ?? 0,

      productStatus: v.productStatus,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  });

  console.log(formatted);
  return formatted;
};

const quickAdd = async (user) => {
  const storeId = user.storeId;

  if (!storeId) {
    throw new HttpError(400, { error: "User has no store" });
  }

  // Check if variants already exist
  const existingVariant = await prisma.productVariants.findFirst({
    where: {
      storeId,
      sku: {
        in: ["SPK-001", "AMP-001"],
      },
    },
  });

  if (existingVariant) {
    throw new HttpError(409, {
      error: "PRODUCT_EXISTS",
      message: "Product already exists",
    });
  }

  // ----- PRODUCTS -----
  const speakerProduct = await prisma.products.create({
    data: {
      storeId,
      productName: "Premium Car Speakers",
      productDescription: 'High-quality 6.5" component speakers',
      productStatus: "ACTIVE",
      approvalStatus: "APPROVED",
      category: "SPEAKERS",
      brand: "PIONEER",
      createdBy: user.userId,
    },
  });

  const amplifierProduct = await prisma.products.create({
    data: {
      storeId,
      productName: "1000W Amplifier",
      productDescription: "Powerful mono block amplifier",
      productStatus: "ACTIVE",
      approvalStatus: "APPROVED",
      category: "AMPLIFIERS",
      brand: "JBL",
      createdBy: user.userId,
    },
  });

  // ----- VARIANTS -----
  const speakerVariant = await prisma.productVariants.create({
    data: {
      storeId,
      productId: speakerProduct.productId,
      sku: "SPK-001",
      barcode: "1234567890123",
      sellingPrice: 149.99,
      isDefault: true,
      thresholdStock: 10,
      productStatus: "ACTIVE",
    },
  });

  const amplifierVariant = await prisma.productVariants.create({
    data: {
      storeId,
      productId: amplifierProduct.productId,
      sku: "AMP-001",
      barcode: "1234567890124",
      sellingPrice: 299.99,
      isDefault: true,
      thresholdStock: 5,
      productStatus: "ACTIVE",
    },
  });

  // ----- STOCK MOVEMENT -----
  await prisma.stockMovements.createMany({
    data: [
      {
        storeId,
        productVariantId: speakerVariant.productVariantId,
        change: 20,
        referenceType: "ADJUSTMENT",
        reason: "Quick add initial stock",
        referenceId: null,
      },
      {
        storeId,
        productVariantId: amplifierVariant.productVariantId,
        change: 20,
        referenceType: "ADJUSTMENT",
        reason: "Quick add initial stock",
        referenceId: null,
      },
    ],
  });

  return { message: "Quick products added successfully" };
};

module.exports = { list, quickAdd };
