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

const create = async (req, res) => {
  try {
    // client tempId (the uploaded file's name) -> URL the file is served from
    const imageUrls = Object.fromEntries(
      (req.files ?? []).map((f) => [f.originalname, `/api/uploads/${f.filename}`])
    );
    res.status(201).json(await productsService.create(req.user, req.body, imageUrls));
  } catch (error) {
    sendError(res, error, "Error creating product:", {
      error: "Failed to create product.",
    });
  }
};

const getByVariant = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid product id." });
  }
  try {
    res.json(await productsService.getByVariant(req.user, id));
  } catch (error) {
    sendError(res, error, "Error fetching product:", {
      error: "Failed to retrieve product.",
    });
  }
};

module.exports = { list, create, getByVariant };
