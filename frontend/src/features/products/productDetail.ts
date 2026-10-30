export type MovementType = "Inbound" | "Outbound" | "Adjustment";

export interface ProductDetail {
  productId: number;
  productName: string;
  productDescription: string | null;
  category: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  variants: {
    productVariantId: number;
    sku: string;
    label: string;
    image: string | null;
  }[];
  images: string[];
  variant: {
    productVariantId: number;
    sku: string;
    barcode: string | null;
    productStatus: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
    sellingPrice: number;
    purchasePrice: { min: number; max: number } | null;
    margin: { min: number; max: number } | null;
    stock: {
      available: number;
      reserved: number | null;
      sold: number;
      value: number | null;
    };
  };
  activity: {
    id: number;
    date: string;
    type: MovementType;
    qty: number;
    reason: string;
    description: string;
  }[];
}

export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export const rupiahRange = (r: { min: number; max: number } | null) =>
  !r ? "—" : r.min === r.max ? rupiah(r.min) : `${rupiah(r.min)}–${r.max.toLocaleString("id-ID")}`;

export const percentRange = (r: { min: number; max: number } | null) =>
  !r ? "—" : r.min === r.max ? `${r.min}%` : `${r.min}% - ${r.max}%`;

export const titleCase = (s: string) =>
  s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB");

export const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const relativeDay = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return longDate(iso);
};
