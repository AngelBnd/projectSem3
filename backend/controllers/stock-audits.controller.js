const { ProductCategory } = require("@prisma/client");
const stockAuditsService = require("../services/stock-audits.service");
const { sendError } = require("../utils/httpError");

const listProducts = async (req, res) => {
  const search = String(req.query.search ?? "").trim();
  const category = String(req.query.category ?? "");
  const page = Math.max(0, parseInt(req.query.page, 10) || 0);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

  try {
    res.json(
      await stockAuditsService.listProducts(req.user, {
        search: search || undefined,
        // ignore anything that is not a real category instead of failing the query
        category: Object.values(ProductCategory).includes(category) ? category : undefined,
        page,
        pageSize,
      })
    );
  } catch (error) {
    sendError(res, error, "Error fetching audit products:", {
      error: "Failed to retrieve products.",
    });
  }
};

const lookup = async (req, res) => {
  const code = String(req.query.code ?? "").trim();
  if (!code) return res.status(400).json({ error: "A barcode or SKU is required." });

  try {
    res.json(await stockAuditsService.lookupByCode(req.user, code));
  } catch (error) {
    sendError(res, error, "Error looking up product:", {
      error: "Failed to look up product.",
    });
  }
};

const create = async (req, res) => {
  try {
    res.status(201).json(await stockAuditsService.create(req.user, req.body));
  } catch (error) {
    sendError(res, error, "Error creating stock audit:", {
      error: "Failed to create stock audit.",
    });
  }
};

module.exports = { listProducts, lookup, create };
