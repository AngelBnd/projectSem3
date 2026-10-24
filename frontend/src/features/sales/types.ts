import type { Dispatch, SetStateAction } from "react";

export type Setter<T> = Dispatch<SetStateAction<T>>;

export interface OrderProduct {
  tempId: string | number;
  productVariantId: number | null;
  productId?: number | null;
  sku?: string;
  barcode?: string;
  variantName?: string;
  productName?: string;
  productCode?: string;
  product?: unknown;
  thresholdStock?: number;
  quantitySold: number;
  unitPrice: number;
}

export interface OrderService {
  tempId: string | number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface GeneralInfo {
  customerName: string;
  orderDate: string;
  paymentTerm: string;
  channelId: number | null;
  subChannelId: number | string | null;
  applyDiscount: boolean;
  discountAmount: number | string;
}

export interface OrderTotals {
  subtotal?: number;
  discount: number;
  totalAmount: number;
}

export interface OrderFormData {
  generalInfo: GeneralInfo;
  totals: OrderTotals;
}


/** A product row of the invoice form (inventory based, no variants). */
export interface TransactionProduct {
  tempId: string | number;
  productCode: string;
  productName: string;
  quantitySold: number | string;
  sellingPrice: number | string;
  initialStock?: number | string;
}

export interface TransactionService {
  tempId: string | number;
  serviceName: string;
  price: number | string;
}

/** Props shared by every step of the create / edit sales order wizard. */
export interface OrderStepProps {
  formData: OrderFormData;
  setFormData: Setter<OrderFormData>;
  newProducts: OrderProduct[];
  newServices: OrderService[];
  setNewProducts: Setter<OrderProduct[]>;
  setNewServices: Setter<OrderService[]>;
}
