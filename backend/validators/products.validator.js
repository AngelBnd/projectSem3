const { z } = require("zod");
const { ProductCategory, ProductBrand, ProductStatus } = require("@prisma/client");

// Shape comes from the frontend's toProductPayload / buildProductSubmission
// (features/products/productMappers.ts). Prices and costs travel as numeric
// strings (Prisma Decimal); stock and threshold travel as integers.
const money = (name) =>
  z
    .union([z.number(), z.string()], { error: `${name} must be a number` })
    .refine((v) => /^\d+(\.\d+)?$/.test(String(v)), {
      message: `${name} must be a non-negative number`,
    });

const required = (name) =>
  z.string({ error: `${name} is required` }).trim().min(1, `${name} is required`);

const count = (name) =>
  z
    .number({ error: `${name} must be a number` })
    .int(`${name} must be a whole number`)
    .min(0, `${name} cannot be negative`);

const supplierLine = z.object({
  supplierId: z.number().int().positive().nullish(), // missing = a brand-new supplier
  supplierName: required("suppliers[].supplierName").max(255),
  cost: money("suppliers[].cost"),
  stock: count("suppliers[].stock"),
});

const attribute = z.object({
  name: required("attributes[].name").max(255),
  value: required("attributes[].value").max(255),
});

const variant = z.object({
  sku: required("variants[].sku").max(255),
  barcode: z.string().trim().max(255).nullish(),
  sellingPrice: money("variants[].sellingPrice"),
  thresholdStock: count("variants[].thresholdStock"),
  productStatus: z.enum(Object.values(ProductStatus), {
    error: "variants[].productStatus is invalid",
  }),
  isDefault: z.boolean().default(false),
  imageRef: z.string().nullish(), // client tempId of an uploaded file
  imageUrl: z.string().max(2048).nullish(), // already-stored image
  attributes: z.array(attribute).default([]),
  suppliers: z.array(supplierLine).default([]),
});

const lower = (s) => s.trim().toLowerCase();

const createBody = z
  .object({
    productName: required("productName").max(255),
    productDescription: z.string().trim().nullish(),
    category: z.enum(Object.values(ProductCategory), { error: "category is invalid" }),
    brand: z.enum(Object.values(ProductBrand), { error: "brand is invalid" }),
    productStatus: z.enum(Object.values(ProductStatus), {
      error: "productStatus is invalid",
    }),
    variants: z.array(variant).min(1, "At least one variant is required"),
  })
  .superRefine((body, ctx) => {
    const issue = (message, path) => ctx.addIssue({ code: "custom", message, path });

    const skus = new Set();
    const combos = new Set();

    body.variants.forEach((v, i) => {
      const sku = lower(v.sku);
      if (skus.has(sku)) issue(`Duplicate SKU "${v.sku}"`, ["variants", i, "sku"]);
      skus.add(sku);

      // a variant can use each attribute once
      const names = v.attributes.map((a) => lower(a.name));
      if (new Set(names).size !== names.length) {
        issue("A variant cannot use the same attribute twice", ["variants", i, "attributes"]);
      }

      // two variants of one product cannot have identical attributes
      const combo = JSON.stringify(
        v.attributes.map((a) => [lower(a.name), lower(a.value)]).sort()
      );
      if (combos.has(combo)) {
        issue("Two variants have the same attribute values", ["variants", i, "attributes"]);
      }
      combos.add(combo);

      // one line per supplier (unique per variant in the database)
      const suppliers = v.suppliers.map((s) => lower(s.supplierName));
      if (new Set(suppliers).size !== suppliers.length) {
        issue("The same supplier is listed twice", ["variants", i, "suppliers"]);
      }
    });

    // every variant must use the same set of attributes
    const attributeSets = new Set(
      body.variants.map((v) => JSON.stringify(v.attributes.map((a) => lower(a.name)).sort()))
    );
    if (attributeSets.size > 1) {
      issue("All variants must use the same attributes", ["variants"]);
    }
  });

module.exports = { create: createBody };
