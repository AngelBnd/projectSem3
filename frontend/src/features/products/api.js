import { api } from "../../lib/api";

export const fetchProductVariants = () => api.get("/api/product-variants");

export const quickAddProducts = () => api.post("/api/product-variants/quick-add");
