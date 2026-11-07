const productVariantsService = require("../services/product-variants.service");
const { sendError } = require("../utils/httpError");

const list = async (req, res) => {
  try {
    // Paginate only when the client asks for it (?page=0&pageSize=10).
    let pagination;
    if (req.query.page !== undefined) {
      pagination = {
        page: Math.max(0, parseInt(req.query.page, 10) || 0),
        pageSize: Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 10)),
      };
    }
    res.json(await productVariantsService.list(req.user, pagination));
  } catch (error) {
    sendError(res, error, "Error fetching product variants:", {
      error: "Failed to retrieve product variants.",
    });
  }
};

const quickAdd = async (req, res) => {
  try {
    res.json(await productVariantsService.quickAdd(req.user));
  } catch (error) {
    sendError(res, error, "Quick add failed:", { error: "FAILED_QUICK_ADD" });
  }
};

module.exports = { list, quickAdd };
