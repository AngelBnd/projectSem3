const productsService = require("../services/products.service");
const { sendError } = require("../utils/httpError");

const list = async (req, res) => {
  try {
    res.json(await productsService.list(req.user));
  } catch (error) {
    sendError(res, error, "Error fetching products:", {
      error: "Failed to retrieve products.",
    });
  }
};

module.exports = { list };
