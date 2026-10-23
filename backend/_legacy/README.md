# Legacy / quarantined files

These files are NOT loaded by the app. They reference an older Prisma schema
(e.g. `prisma.user`, `prisma.lineItems`) that no longer exists, and are kept only
so logic can be ported out of them. Delete once nothing is left to port.

- `server2UNUSED.js` - old monolithic server
- `inventory.js` - old /api/inventory routes (frontend Inventory.jsx still calls these)
- `invoices.js`, `invoicesTemp.js` - old /api/invoices routes
