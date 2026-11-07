import type {
  AttributeInput,
  ImageItem,
  ProductInfo,
  ProductVariantRow,
  ProductStatus,
} from "./types";

/** What GET /api/products/variant/:id/form returns. */
export interface ProductFormResponse {
  productId: number;
  productName: string;
  productDescription: string | null;
  category: string;
  brand: string;
  productStatus: ProductStatus;
  variants: {
    productVariantId: number;
    sku: string;
    barcode: string | null;
    sellingPrice: string;
    thresholdStock: number;
    productStatus: ProductStatus;
    isDefault: boolean;
    image: string | null;
    attributes: { name: string; value: string }[];
    suppliers: { supplierId: number; supplierName: string; cost: string }[];
  }[];
}

const newImage = (url: string): ImageItem => ({
  tempId: crypto.randomUUID(),
  url, // a stored image: sent back as its URL, never re-uploaded
});

/**
 * Turns a stored product into the same form state the create flow builds, so the
 * same steps can edit it. Stock is not part of the form: it is only ever changed
 * through stock movements, so the stock fields stay empty (and locked) here.
 */
export const productToForm = (p: ProductFormResponse): ProductInfo => {
  const rows = p.variants;
  const hasVariants = rows.some((v) => v.attributes.length > 0);

  // attribute names, and each one's values, in the order they first appear
  const names: string[] = [];
  const values = new Map<string, string[]>();
  rows.forEach((v) =>
    v.attributes.forEach((a) => {
      if (!values.has(a.name)) {
        values.set(a.name, []);
        names.push(a.name);
      }
      const list = values.get(a.name)!;
      if (!list.includes(a.value)) list.push(a.value);
    })
  );

  const attributes: AttributeInput[] = names.map((name) => ({
    tempId: crypto.randomUUID(),
    name,
    values: values.get(name)!,
    useImages: false,
    images: {},
  }));

  // Without variants, the one stored image lives on the product, like in the create form.
  const productImage = !hasVariants && rows[0]?.image ? newImage(rows[0].image) : null;

  const variants: ProductVariantRow[] = rows.map((v) => ({
    tempId: crypto.randomUUID(),
    productVariantId: v.productVariantId,
    // keys follow the attribute order, which is what the variant table matches on
    attributes: Object.fromEntries(
      names.map((n) => [n, v.attributes.find((a) => a.name === n)?.value ?? ""])
    ),
    sku: v.sku,
    barcode: v.barcode ?? "",
    sellingPrice: v.sellingPrice,
    thresholdStock: String(v.thresholdStock),
    productStatus: v.productStatus,
    isDefault: hasVariants ? v.isDefault : true,
    imageRef: productImage ? productImage.tempId : null,
    images: hasVariants && v.image ? [newImage(v.image)] : [],
    suppliers: v.suppliers.map((s) => ({
      tempId: crypto.randomUUID(),
      supplierId: String(s.supplierId),
      supplierName: s.supplierName,
      stock: "", // locked in edit mode; the server ignores it
      cost: s.cost,
    })),
  }));

  return {
    productName: p.productName,
    // the form's selects hold the enum NAME; the numeric enum type is only nominal
    productCategory: p.category as unknown as ProductInfo["productCategory"],
    productBrand: p.brand as unknown as ProductInfo["productBrand"],
    description: p.productDescription ?? "",
    productStatus: p.productStatus,
    hasVariants,
    sameCost: false,
    images: productImage ? [productImage] : [],
    attributes,
    variants,
  };
};
