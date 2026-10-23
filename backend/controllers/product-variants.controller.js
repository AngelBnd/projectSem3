const productVariantsService = require("../services/product-variants.service");
const { sendError } = require("../utils/httpError");

const list = async (req, res) => {
  try {
    res.json(await productVariantsService.list(req.user));
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
