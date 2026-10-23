// routes/auth.js
const express = require("express");
const validate = require("../middleware/validate");
const authValidator = require("../validators/auth.validator");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/register", validate(authValidator.register), authController.register);
router.post("/login", validate(authValidator.login), authController.login);
router.post("/validate", validate(authValidator.validateField), authController.validateField);

module.exports = router;
