// Pages are thin: each feature owns its screens, this file just collects them for the router.
export { Dashboard } from "../features/dashboard";
export { Inventory, InputInventory } from "../features/inventory";
export {
  SalesPage,
  SalesDetails,
  InputSales,
  CreateOrderSale,
} from "../features/sales";
export { Products, CreateProduct } from "../features/products";
export { Login, Register, AccessStatus } from "../features/auth";
export { Users } from "../features/users";
