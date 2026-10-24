export type DeliveryStatus =
  | "DELIVERED"
  | "PARTIALLY_DELIVERED"
  | "UNDELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PAID" | "PARTIALLY_PAID" | "UNPAID";

export interface AuthUser {
  userId: number | string;
  storeId: number | string;
  permissions: string[];
  roleNames: string[];
  primaryRole: string;
  exp?: number;
  [key: string]: unknown;
}

/** A row of GET /api/sales-order. */
export interface SalesOrderSummary {
  id: number | string;
  customer: string;
  date: string;
  totalAmount: number | string;
  channel: string;
  subChannel: string;
  deliveryStatus: DeliveryStatus | string;
  paymentStatus: PaymentStatus | string;
}

export interface SalesOrderItem {
  productVariantId?: number | null;
  sku?: string;
  productName?: string;
  variantName?: string;
  serviceDesc?: string;
  quantityOrdered?: number;
  unitPrice?: number | string;
}

/** GET /api/sales-order/:id. */
export interface SalesOrderDetail {
  customerName: string;
  orderDate: string;
  paymentTerms: string;
  channelId: number | null;
  subChannelId: number | null;
  discount: number;
  totalAmount: number;
  items?: SalesOrderItem[];
}

export interface ProductVariant {
  productVariantId: number;
  productName: string;
  variantName: string;
  sku: string;
  barcode?: string;
  sellingPrice: number | string;
  thresholdStock?: number;
  productStatus?: string;
  productId?: number | null;
  productCode?: string;
  category?: string;
  [key: string]: unknown;
}

export interface InventoryItem {
  productCode: string;
  productName: string;
  productBrand?: string;
  productCategory?: string;
  unitCost?: number | string;
  sellingPrice?: number | string;
  initialStock: number | string;
  thresholdStock: number | string;
  lastUpdated?: string;
  [key: string]: unknown;
}

export interface ManagedUser {
  userId: number | string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: unknown;
}

/** Invoice header used by the invoice view and the PDF export. */
export interface InvoiceData {
  invoiceId?: number | string;
  discount?: number | string;
  invoiceDate?: string;
  name?: string;
  subject?: string;
  paymentMethod?: string;
  [key: string]: unknown;
}

export interface InvoiceProduct {
  productName?: string;
  quantitySold?: number;
  sellingPrice?: number;
  [key: string]: unknown;
}
