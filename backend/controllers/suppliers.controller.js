const suppliersService = require("../services/suppliers.service");
const { sendError } = require("../utils/httpError");

const list = async (req, res) => {
  try {
    res.json(await suppliersService.list(req.user));
  } catch (error) {
    sendError(res, error, "Error fetching products:", {
      error: "Failed to retrieve products.",
    });
  }
};

module.exports = { list };
