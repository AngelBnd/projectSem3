const express = require("express");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadImages, parseJsonField } = require("../middleware/upload");
const productsValidator = require("../validators/products.validator");
const productsController = require("../controllers/products.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, productsController.list);
router.post(
  "/",
  uploadImages,
  parseJsonField("data"),
  validate(productsValidator.create),
  productsController.create
);

module.exports = router;
