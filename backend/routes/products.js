const express = require("express");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadImages, parseJsonField } = require("../middleware/upload");
const productsValidator = require("../validators/products.validator");
const productsController = require("../controllers/products.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, productsController.list);
router.get("/variant/:id", productsController.getByVariant);
router.get("/variant/:id/form", productsController.getFormByVariant);
router.post(
  "/",
  uploadImages,
  parseJsonField("data"),
  validate(productsValidator.create),
  productsController.create
);

router.put(
  "/:id",
  uploadImages,
  parseJsonField("data"),
  validate(productsValidator.update),
  productsController.update
);

module.exports = router;
