import { api } from "../../lib/api";

export const fetchSalesOrders = () => api.get("/api/sales-order");

export const fetchSalesOrder = (id) => api.get(`/api/sales-order/${id}`);

export const fetchSalesChannels = () => api.get("/api/sales-order/channels");

export const saveSalesOrder = (id, payload) =>
  id
    ? api.put(`/api/sales-order/${id}`, payload)
    : api.post("/api/sales-order", payload);

export const deleteSalesOrder = (id) => api.delete(`/api/sales-order/${id}`);

export const populateSalesOrder = () => api.post("/api/sales-order/populate");

export const fetchInvoiceLineItems = (invoiceId) =>
  api.get(`/api/invoices/lineitems/${encodeURIComponent(invoiceId)}`);

export const saveInvoice = (invoiceId, invoice) =>
  invoiceId
    ? api.put(`/api/sales/${invoiceId}`, invoice)
    : api.post("/api/sales", invoice);
