import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  submittedImages,
  submittedVariants,
  usedAttributes,
} from "./productMappers";
import type { ProductInfo } from "./types";

const DECIMAL = /^\d+(\.\d+)?$/;
const WHOLE = /^\d+$/;

/** Returns every problem found, in reading order. An empty array means the form can be submitted. */
export const validateProduct = (f: ProductInfo): string[] => {
  const errors: string[] = [];

  /* ---- general info ---- */
  if (!f.productName.trim()) errors.push("Product name is required.");
  // `=== ""` and not `!value`: a numeric enum value of 0 is a valid selection
  if (f.productCategory === "") errors.push("Choose a category.");
  if (f.productBrand === "") errors.push("Choose a brand.");

  /* ---- attributes ---- */
  if (f.hasVariants) {
    f.attributes.forEach((a, i) => {
      const name = a.name.trim();
      if (!name && !a.values.length) return; // an untouched row is ignored
      if (!name) errors.push(`Attribute ${i + 1}: choose a name.`);
      else if (!a.values.length) errors.push(`${name}: add at least one value.`);
    });

    const used = usedAttributes(f);
    if (!used.length) errors.push("Add at least one attribute with values.");

    const names = used.map((a) => a.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      errors.push("Each attribute can only be used once.");
    }
  }

  /* ---- variants ---- */
  const skus = new Set<string>();

  submittedVariants(f).forEach((v) => {
    const label = f.hasVariants
      ? usedAttributes(f)
          .map((a) => v.attributes[a.name])
          .filter(Boolean)
          .join(" / ") || "Variant"
      : "Product";

    const sku = v.sku.trim().toLowerCase();
    if (!sku) errors.push(`${label}: SKU is required.`);
    else if (skus.has(sku)) errors.push(`${label}: SKU "${v.sku.trim()}" is used more than once.`);
    else skus.add(sku);

    const price = v.sellingPrice.trim();
    if (!price) errors.push(`${label}: price is required.`);
    else if (!DECIMAL.test(price)) errors.push(`${label}: price must be a positive number.`);

    const threshold = v.thresholdStock.trim();
    if (threshold && !WHOLE.test(threshold)) {
      errors.push(`${label}: threshold must be a whole number.`);
    }

    const seen = new Set<string>();
    v.suppliers.forEach((s) => {
      const name = s.supplierName.trim();
      const stock = s.stock.trim();
      const cost = s.cost.trim();

      if (!name) {
        if (stock || cost) errors.push(`${label}: choose a supplier or clear its stock and cost.`);
        return;
      }
      if (seen.has(name.toLowerCase())) errors.push(`${label}: supplier "${name}" is listed twice.`);
      seen.add(name.toLowerCase());

      if (stock && !WHOLE.test(stock)) errors.push(`${label}: ${name} stock must be a whole number.`);
      if (cost && !DECIMAL.test(cost)) errors.push(`${label}: ${name} cost must be a positive number.`);
    });
  });

  /* ---- images (same limits as the server) ---- */
  submittedImages(f).forEach((img) => {
    if (!img.file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(img.file.type)) {
      errors.push(`${img.file.name}: only PNG, JPG or WEBP images are allowed.`);
    } else if (img.file.size > MAX_IMAGE_BYTES) {
      errors.push(`${img.file.name}: images must be 5 MB or smaller.`);
    }
  });

  return errors;
};
