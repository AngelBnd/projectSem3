import { api } from "../../lib/api";
import type { SalesOrderDetail, SalesOrderSummary } from "../../types";

export interface SalesChannel {
  channelId: number;
  name: string;
  subChannels?: Array<{ subChannelId: number; subChannelName: string }>;
  [key: string]: unknown;
}

export type OrderId = number | string;

export const fetchSalesOrders = () =>
  api.get<SalesOrderSummary[]>("/api/sales-order");

export const fetchSalesOrder = (id: OrderId) =>
  api.get<SalesOrderDetail>(`/api/sales-order/${id}`);

export const fetchSalesChannels = () =>
  api.get<SalesChannel[]>("/api/sales-order/channels");

export const saveSalesOrder = (id: OrderId | undefined, payload: unknown) =>
  id
    ? api.put(`/api/sales-order/${id}`, payload)
    : api.post("/api/sales-order", payload);

export const deleteSalesOrder = (id: OrderId) =>
  api.delete(`/api/sales-order/${id}`);

export const populateSalesOrder = () => api.post("/api/sales-order/populate");

export interface InvoiceLineItem {
  quantitySold?: number;
  [key: string]: unknown;
}

export const fetchInvoiceLineItems = (invoiceId: OrderId) =>
  api.get<InvoiceLineItem[]>(
    `/api/invoices/lineitems/${encodeURIComponent(String(invoiceId))}`
  );

export const saveInvoice = (invoiceId: OrderId | null, invoice: unknown) =>
  invoiceId
    ? api.put(`/api/sales/${invoiceId}`, invoice)
    : api.post("/api/sales", invoice);
