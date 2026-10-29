import { GeneralInfo, OrderProduct } from "../sales/types";
import type { Dispatch, SetStateAction } from "react";

export type Setter<T> = Dispatch<SetStateAction<T>>;

// export interface Product {
//   tempId: string | number;
//   productVariantId: number | null;
//   productId?: number | null;
//   sku?: string;
//   barcode?: string;
//   variantName?: string;
//   productName?: string;
//   productCode?: string;
//   product?: unknown;
//   thresholdStock?: number;
//   quantitySold: number;
//   unitPrice: number;
// }

export enum ProductCategory {
  "HEAD_UNITS",
  "SPEAKERS",
  "AMPLIFIERS",
  "SUBWOOFERS",
  "WIRING_ACCESSORIES",
  "SIGNAL_PROCESSORS",
  "BLUETOOTH_MODULES",
  "BACKUP_CAMERAS",
  "CARPLAY_ANDROIDAUTO",
  "DASH_KITS",
  "INSTALLATION_ACCESSORIES",
  "SOUND_DEADENING",
  "BATTERIES_POWER",
  "LIGHTING_ACCESSORIES",
  "SECURITY_SYSTEMS",
  "RADAR_DETECTORS",
}

export enum ProductBrand {
  "PIONEER",
  "ALPINE",
  "KENWOOD",
  "JVC",
  "SONY",
  "JBL",
  "KICKER",
  "ROCKFORD_FOSGATE",
  "AUDIOCONTROL",
  "MTX",
  "INFINITY",
  "JL_AUDIO",
  "BOSS_AUDIOSYSTEMS",
  "DS18",
  "NVX",
  "STINGER",
  "CRUCHFIELD",
  "METRA",
  "SCOSCHE",
  "PAC",
}

export type ImageItem = {
  tempId: string; // client-only key
  imageId?: number; // set once saved on the server
  file?: File; // present only for newly added images
  url: string; // server URL, or a local preview URL for new files
};

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DISCONTINUED = "DISCONTINUED",
}

export interface SupplierLine {
  tempId: string;
  supplierId: string;
  supplierName: string;
  stock: string;
  cost: string;
}

export interface ProductVariantRow {
  tempId: string;
  productVariantId?: number;
  attributes: Record<string, string>;
  sku: string;
  barcode: string;
  sellingPrice: string;
  thresholdStock: string;
  productStatus: ProductStatus;
  isDefault: boolean;
  imageRef: string | null;

  images: ImageItem[];
  suppliers: SupplierLine[];
}

export interface ProductInfo {
  productName: string;
  productCategory: ProductCategory | "";
  productBrand: ProductBrand | "";
  description: string;
  productStatus: ProductStatus;
  hasVariants: boolean;
  sameCost: boolean;

  images: ImageItem[];
  attributes: AttributeInput[];
  variants: ProductVariantRow[];
}

export interface ProductOrderStepProps {
  formData: ProductInfo;
  setFormData: React.Dispatch<React.SetStateAction<ProductInfo>>;
}

export interface AttributeInput {
  tempId: string;
  name: string;
  values: string[];
  useImages: boolean;
  images: Record<string, ImageItem[]>;
}

export type SupplierOption = { id: number; name: string };
