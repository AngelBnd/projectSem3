import { ProductBrand, ProductCategory } from "./types";
import type {
  AttributeInput,
  ImageItem,
  ProductInfo,
  ProductVariantRow,
} from "./types";

// The backend accepts the same limits (middleware/upload.js).
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * The backend wants the enum NAME ("HEAD_UNITS"). ProductCategory and ProductBrand
 * are numeric enums here, so a stored 0 or "0" is turned back into its name.
 * A value that is already a name passes through unchanged.
 */
const enumName = (e: Record<string, string | number>, value: unknown): string => {
  const v = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof v === "number" ? String(e[v]) : String(v);
};

/** Attributes that are actually used: a name and at least one value. */
export const usedAttributes = (f: ProductInfo): AttributeInput[] =>
  f.hasVariants ? f.attributes.filter((a) => a.name.trim() && a.values.length) : [];

/** Without variants the product is its own single variant. */
export const submittedVariants = (f: ProductInfo): ProductVariantRow[] =>
  f.hasVariants ? f.variants : f.variants.slice(0, 1);

/** The image a variant uses: its own reference, else its attribute value's first image. */
export const imageForVariant = (
  f: ProductInfo,
  v: ProductVariantRow
): ImageItem | undefined => {
  const pool = f.hasVariants
    ? f.attributes.flatMap((a) => Object.values(a.images).flat())
    : f.images;

  const byRef = v.imageRef ? pool.find((i) => i.tempId === v.imageRef) : undefined;
  if (byRef) return byRef;

  if (!f.hasVariants) return f.images[0];

  for (const a of usedAttributes(f)) {
    if (!a.useImages) continue;
    const img = a.images[v.attributes[a.name]]?.[0];
    if (img) return img;
  }
  return undefined;
};

/** Every distinct image that will be sent (variants can share one). */
export const submittedImages = (f: ProductInfo): ImageItem[] => {
  const byId = new Map<string, ImageItem>();
  submittedVariants(f).forEach((v) => {
    const img = imageForVariant(f, v);
    if (img) byId.set(img.tempId, img);
  });
  return [...byId.values()];
};

const toVariantPayload = (
  f: ProductInfo,
  v: ProductVariantRow,
  image: ImageItem | undefined
) => ({
  sku: v.sku.trim(),
  barcode: v.barcode.trim() || null,
  sellingPrice: v.sellingPrice.trim() === "" ? "0" : v.sellingPrice.trim(),
  thresholdStock: v.thresholdStock.trim() === "" ? 0 : Number(v.thresholdStock),
  productStatus: v.productStatus,
  isDefault: f.hasVariants ? v.isDefault : true,

  // A new file is matched on the server by its tempId; an already-stored image is sent as its URL.
  imageRef: image?.file ? image.tempId : undefined,
  imageUrl: image && !image.file ? image.url : undefined,

  attributes: usedAttributes(f).map((a) => ({
    name: a.name.trim(),
    value: (v.attributes[a.name] ?? "").trim(),
  })),

  // blank lines are dropped; a supplier with no id is created by the server
  suppliers: v.suppliers
    .filter((s) => s.supplierName.trim() !== "")
    .map((s) => ({
      supplierId: s.supplierId ? Number(s.supplierId) : undefined,
      supplierName: s.supplierName.trim(),
      cost: s.cost.trim() === "" ? "0" : s.cost.trim(),
      stock: s.stock.trim() === "" ? 0 : Number(s.stock),
    })),
});

/**
 * The whole form as multipart/form-data:
 *  - "data":   the product as JSON
 *  - "images": each new image file, named with its tempId so the server can
 *              link it back to the variants that use it
 * storeId, createdBy and approvalStatus are decided by the server.
 */
export const buildProductSubmission = (f: ProductInfo): FormData => {
  const images = new Map<string, ImageItem>();

  const variants = submittedVariants(f).map((v) => {
    const image = imageForVariant(f, v);
    if (image) images.set(image.tempId, image);
    return toVariantPayload(f, v, image);
  });

  const payload = {
    productName: f.productName.trim(),
    productDescription: f.description.trim() || null,
    category: enumName(ProductCategory, f.productCategory),
    brand: enumName(ProductBrand, f.productBrand),
    productStatus: f.productStatus,
    variants,
  };

  const body = new FormData();
  body.append("data", JSON.stringify(payload));
  images.forEach((img) => {
    if (img.file) body.append("images", img.file, img.tempId);
  });
  return body;
};
